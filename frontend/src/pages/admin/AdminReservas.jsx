import { useState, useEffect } from 'react';
import { fetchApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Button, Input, Label } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { format } from '../../utils/dateUtils';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../utils/utils';

const RESERVATIONS_PAGE_SIZE = 10;

const AdminReservas = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null,
    usuarioId: '', 
    espacioId: '', 
    fecha: new Date().toISOString().split('T')[0], 
    horaInicio: '', 
    horaFin: '',
    estadoId: '' 
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');

  // Reference data for dropdowns (from dedicated admin endpoints)
  const [users, setUsers] = useState([]);     // UsuarioReservaOptionResponse: { id, nombre, correo }
  const [spaces, setSpaces] = useState([]);   // EspacioReporteOptionResponse: { id, nombre, tipoNombre }
  const [estados, setEstados] = useState([]); // EstadoReservaOptionResponse: { id, nombre }

  const loadReservations = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), size: String(RESERVATIONS_PAGE_SIZE) });
      const res = await fetchApi(`/api/admin/reservas?${params.toString()}`);
      // Backend returns ReservaAdminListadoResponse: { pagina: { content, pageNumber, ... }, resumen: { ... } }
      setData(res.pagina || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadReferences = async () => {
    try {
      const [uRes, sRes, eRes] = await Promise.all([
        fetchApi('/api/admin/reservas/usuarios'),
        fetchApi('/api/admin/reservas/espacios'),
        fetchApi('/api/admin/reservas/estados')
      ]);
      setUsers(uRes || []);
      setSpaces(sRes || []);
      setEstados(eRes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReferences();
    loadReservations(0);
  }, []);

  useEffect(() => {
    setAvailabilityResult(null);
    setAvailabilityError('');
  }, [formData.espacioId, formData.fecha, formData.horaInicio, formData.horaFin]);

  const openNewForm = () => {
    setIsNew(true);
    // Default to first available option for each dropdown
    const defaultEstado = estados.find(e => e.nombre === 'CONFIRMADA')?.id || estados[0]?.id || '';
    setFormData({ 
      id: null, 
      usuarioId: users[0]?.id ? String(users[0].id) : '', 
      espacioId: spaces[0]?.id ? String(spaces[0].id) : '', 
      fecha: new Date().toISOString().split('T')[0], 
      horaInicio: '', 
      horaFin: '', 
      estadoId: defaultEstado ? String(defaultEstado) : ''
    });
    setAvailabilityResult(null);
    setAvailabilityError('');
    setIsFormOpen(true);
  };

  const openEditForm = (reserva) => {
    setIsNew(false);
    // ReservaAdminResponse has: id, usuarioId, espacioId, fecha, horaInicio, horaFin, estadoId, estado
    setFormData({ 
      id: reserva.id,
      usuarioId: reserva.usuarioId ? String(reserva.usuarioId) : '', 
      espacioId: reserva.espacioId ? String(reserva.espacioId) : '', 
      fecha: reserva.fecha, 
      horaInicio: reserva.horaInicio?.slice(0,5) || '', 
      horaFin: reserva.horaFin?.slice(0,5) || '',
      estadoId: reserva.estadoId ? String(reserva.estadoId) : ''
    });
    setAvailabilityResult(null);
    setAvailabilityError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = isNew ? '/api/admin/reservas' : `/api/admin/reservas/${formData.id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Backend expects ReservaAdminRequest: { usuarioId (Long), espacioId (Long), estadoId (Long), fecha, horaInicio, horaFin }
      await fetchApi(url, {
        method,
        body: JSON.stringify({
          usuarioId: Number(formData.usuarioId),
          espacioId: Number(formData.espacioId),
          estadoId: Number(formData.estadoId),
          fecha: formData.fecha,
          horaInicio: formData.horaInicio.length === 5 ? formData.horaInicio + ":00" : formData.horaInicio,
          horaFin: formData.horaFin.length === 5 ? formData.horaFin + ":00" : formData.horaFin,
        })
      });
      
      setIsFormOpen(false);
      loadReservations(data.pageNumber);
    } catch (err) {
      alert(err.message || 'Error al guardar reserva');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (reserva) => {
    setDeleteTarget(reserva);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      await fetchApi(`/api/admin/reservas/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadReservations(data.pageNumber);
    } catch (err) {
      alert(err.message || 'Error al eliminar la reserva');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckAvailability = async () => {
    if (!formData.espacioId) {
      setAvailabilityError('Selecciona un espacio para verificar disponibilidad.');
      return;
    }

    if (!formData.fecha) {
      setAvailabilityError('Selecciona una fecha para verificar disponibilidad.');
      return;
    }

    try {
      setAvailabilityChecking(true);
      setAvailabilityError('');
      const params = new URLSearchParams({ fecha: formData.fecha });
      if (formData.horaInicio && formData.horaFin) {
        params.set('horaInicio', formData.horaInicio);
        params.set('horaFin', formData.horaFin);
      }
      const data = await fetchApi(`/api/espacios/${formData.espacioId}/disponibilidad?${params.toString()}`);
      setAvailabilityResult(data);
    } catch (err) {
      setAvailabilityError(err.message || 'No fue posible verificar disponibilidad.');
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-slate-500";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('admin.reservations.title')}</h2>
          <p className="text-slate-500 dark:text-zinc-400">{t('admin.reservations.desc')}</p>
        </div>
        <Button onClick={openNewForm} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          {t('admin.reservations.createManual')}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-medium">{error}</div>
      ) : loading ? (
        <div className="h-40 flex items-center justify-center text-slate-500">{t('common.loading')}</div>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-zinc-900 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">{t('admin.reservations.tableUser')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.reservations.tableSpace')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.reservations.tableDate')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.reservations.tableTime')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.reservations.tableStatus')}</th>
                  <th scope="col" className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {data.content.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{res.usuarioNombre}</td>
                    <td className="px-6 py-4">{res.nombreEspacio}</td>
                    <td className="px-6 py-4">{format(res.fecha)}</td>
                    <td className="px-6 py-4">{res.horaInicio?.slice(0,5)} - {res.horaFin?.slice(0,5)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                        res.estado === 'CONFIRMADA' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : res.estado === 'CANCELADA' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : res.estado === 'FINALIZADA' ? "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {res.estado === 'CONFIRMADA' ? t('myReservations.statusConfirmed')
                          : res.estado === 'CANCELADA' ? t('myReservations.statusCancelled')
                          : res.estado === 'FINALIZADA' ? t('myReservations.statusFinalized')
                          : res.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button variant="ghost" className="h-8 w-8 p-0" title={t('common.edit')} onClick={() => openEditForm(res)}>
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                           title="Eliminar"
                           onClick={() => openDeleteModal(res)}
                           disabled={deletingId === res.id}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      {t('admin.reservations.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-zinc-800">
            <p className="text-sm text-slate-500">
              {t('common.page')} {data.pageNumber + 1} {t('common.of')} {data.totalPages || 1}
            </p>
            <div className="space-x-2">
              <Button variant="outline" disabled={data.pageNumber === 0} onClick={() => loadReservations(data.pageNumber - 1)}>{t('common.previous')}</Button>
              <Button variant="outline" disabled={data.pageNumber >= data.totalPages - 1} onClick={() => loadReservations(data.pageNumber + 1)}>{t('common.next')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => !saving && setIsFormOpen(false)} title={isNew ? t('admin.reservations.new') : t('admin.reservations.edit')}>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {isNew && (
            <div className="space-y-2">
              <Label htmlFor="usuarioId">{t('admin.reservations.userLabel')}</Label>
              <select 
                id="usuarioId" 
                className={selectClasses}
                value={formData.usuarioId}
                onChange={e => setFormData(prev => ({...prev, usuarioId: e.target.value}))}
                required
              >
                <option value="" disabled className="dark:bg-zinc-900">Seleccionar...</option>
                {users.map(u => <option key={u.id} value={u.id} className="dark:bg-zinc-900">{u.nombre} ({u.correo})</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="espacioId">{t('admin.reservations.spaceLabel')}</Label>
             <select 
              id="espacioId" 
              className={selectClasses}
              value={formData.espacioId}
              onChange={e => setFormData(prev => ({...prev, espacioId: e.target.value}))}
              required
            >
              <option value="" disabled className="dark:bg-zinc-900">Seleccionar...</option>
              {spaces.map(s => <option key={s.id} value={s.id} className="dark:bg-zinc-900">{s.nombre} ({t(`admin.spaceTypes.${s.tipoNombre}`, s.tipoNombre)})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="fecha">{t('admin.reservations.dateLabel')}</Label>
              <Input id="fecha" type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">{t('admin.reservations.statusLabel')}</Label>
               <select 
                id="estado" 
                className={selectClasses}
                value={formData.estadoId}
                onChange={e => setFormData(prev => ({...prev, estadoId: e.target.value}))}
                required
              >
                <option value="" disabled className="dark:bg-zinc-900">Seleccionar...</option>
                {estados.map(e => <option key={e.id} value={e.id} className="dark:bg-zinc-900">{e.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="horaInicio">{t('admin.reservations.startTimeLabel')}</Label>
              <Input id="horaInicio" type="time" value={formData.horaInicio} onChange={e => setFormData(prev => ({...prev, horaInicio: e.target.value}))} required />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="horaFin">{t('admin.reservations.endTimeLabel')}</Label>
              <Input id="horaFin" type="time" value={formData.horaFin} onChange={e => setFormData(prev => ({...prev, horaFin: e.target.value}))} required />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={handleCheckAvailability} disabled={availabilityChecking}>
              {availabilityChecking ? 'Verificando...' : 'Verificar disponibilidad'}
            </Button>
            {availabilityResult?.mensajeDisponibilidad && (
              <span className={cn(
                "text-xs font-medium",
                availabilityResult.rangoConsultadoDisponible ? "text-emerald-500" : "text-red-500"
              )}>
                {availabilityResult.mensajeDisponibilidad}
              </span>
            )}
          </div>

          {availabilityError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              {availabilityError}
            </div>
          )}

          {availabilityResult && (
            <div className={cn(
              "rounded-md border px-3 py-2 text-xs",
              availabilityResult.rangoConsultadoDisponible
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
            )}>
              {availabilityResult.rangoConsultadoDisponible
                ? 'El horario seleccionado esta disponible.'
                : 'El horario seleccionado tiene conflicto.'}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-200 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        title="Eliminar reserva"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Seguro que deseas eliminar esta reserva? Esta accion no se puede deshacer.
          </p>
          {deleteTarget && (
            <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
              <div className="font-semibold">{deleteTarget.nombreEspacio}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                {deleteTarget.usuarioNombre} · {format(deleteTarget.fecha)} · {deleteTarget.horaInicio?.slice(0,5)} - {deleteTarget.horaFin?.slice(0,5)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeDeleteModal} disabled={!!deletingId}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={!!deletingId}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingId ? t('common.saving') : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminReservas;
