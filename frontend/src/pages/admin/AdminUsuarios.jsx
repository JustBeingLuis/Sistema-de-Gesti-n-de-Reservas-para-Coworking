import { useState, useEffect } from 'react';
import { fetchApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { Button, Input, Label } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { Edit } from 'lucide-react';
import { cn } from '../../utils/utils';

const USERS_PAGE_SIZE = 10;

const AdminUsuarios = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roles, setRoles] = useState([]); // Array of { id, nombre }
  const [saving, setSaving] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState('');

  const loadUsers = async (page = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), size: String(USERS_PAGE_SIZE) });
      const res = await fetchApi(`/api/admin/usuarios?${params.toString()}`);
      // Backend returns { pagina: { content, pageNumber, ... }, resumen: { ... } }
      setData(res.pagina || { content: [], pageNumber: 0, totalPages: 0, totalElements: 0 });
    } catch (err) {
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      // Backend returns List<RolOptionResponse> = [{ id: 1, nombre: "ADMIN" }, { id: 2, nombre: "USUARIO" }]
      const res = await fetchApi('/api/admin/usuarios/roles');
      setRoles(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers(0);
  }, []);

  const handleEditClick = (user) => {
    // user from backend has: id, nombre, correo, activo, rolId, rolNombre
    setEditingUser({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      activo: user.activo,
      rolId: user.rolId
    });
    setIsEditOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Backend expects UsuarioAdminRequest: { nombre, correo, password?, activo, rolId }
      await fetchApi(`/api/admin/usuarios/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: editingUser.nombre,
          correo: editingUser.correo,
          activo: editingUser.activo,
          rolId: editingUser.rolId
        })
      });
      setIsEditOpen(false);
      loadUsers(data.pageNumber);
    } catch (err) {
      alert(err.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEstado = (user) => {
    setToggleTarget(user);
    setToggleError('');
  };

  const closeToggleModal = () => {
    if (toggling) return;
    setToggleTarget(null);
    setToggleError('');
  };

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    try {
      setToggling(true);
      // Backend expects @RequestParam Boolean activo (query parameter, NOT body)
      const newState = !toggleTarget.activo;
      await fetchApi(`/api/admin/usuarios/${toggleTarget.id}/estado?activo=${newState}`, {
        method: 'PATCH'
      });
      setToggleTarget(null);
      loadUsers(data.pageNumber);
    } catch (err) {
      setToggleError(err.message || 'Error changing status');
    } finally {
      setToggling(false);
    }
  };

  const selectClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-slate-500";

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('admin.users.title')}</h2>
        <p className="text-slate-500 dark:text-zinc-400">{t('admin.users.desc')}</p>
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
                  <th scope="col" className="px-6 py-4">{t('admin.users.tableUser')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.users.tableEmail')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.users.tableRole')}</th>
                  <th scope="col" className="px-6 py-4">{t('admin.users.tableStatus')}</th>
                  <th scope="col" className="px-6 py-4 text-right">{t('admin.users.tableActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {data.content.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{user.nombre}</td>
                    <td className="px-6 py-4">{user.correo}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {user.rolNombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 flex w-fit items-center gap-1.5 rounded-full text-xs font-semibold",
                        user.activo 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {user.activo ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" className="h-8 w-8 p-0" title={t('common.edit')} onClick={() => handleEditClick(user)}>
                        <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                        variant={user.activo ? "ghost" : "primary"} 
                        className={cn("h-8 text-xs", user.activo && "text-red-600 hover:text-red-700 dark:text-red-400")}
                        onClick={() => handleToggleEstado(user)}
                       >
                        {user.activo ? t('admin.users.deactivate') : t('admin.users.activate')}
                       </Button>
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      {t('admin.users.noData')}
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
              <Button variant="outline" disabled={data.pageNumber === 0} onClick={() => loadUsers(data.pageNumber - 1)}>{t('common.previous')}</Button>
              <Button variant="outline" disabled={data.pageNumber >= data.totalPages - 1} onClick={() => loadUsers(data.pageNumber + 1)}>{t('common.next')}</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => !saving && setIsEditOpen(false)} title={t('admin.users.edit')}>
        {editingUser && (
          <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">{t('admin.users.nameLabel')}</Label>
              <Input 
                id="nombre" 
                value={editingUser.nombre} 
                onChange={e => setEditingUser({...editingUser, nombre: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rol">{t('admin.users.roleLabel')}</Label>
              <select 
                id="rol" 
                className={selectClasses}
                value={editingUser.rolId}
                onChange={e => setEditingUser({...editingUser, rolId: Number(e.target.value)})}
                required
              >
                <option value="" disabled className="dark:bg-zinc-900">Seleccionar...</option>
                {roles.map(r => <option key={r.id} value={r.id} className="dark:bg-zinc-900">{r.nombre}</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-200 dark:border-zinc-800">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!toggleTarget}
        onClose={closeToggleModal}
        title={toggleTarget?.activo ? t('admin.users.deactivate') : t('admin.users.activate')}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {toggleTarget?.activo ? t('admin.users.confirmDesact') : t('admin.users.confirmAct')}
          </p>
          {toggleTarget && (
            <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
              <div className="font-semibold">{toggleTarget.nombre}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">{toggleTarget.correo}</div>
            </div>
          )}
          {toggleError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              {toggleError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeToggleModal} disabled={toggling}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleToggleConfirm}
              disabled={toggling}
              className={toggleTarget?.activo
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }
            >
              {toggling ? t('common.saving') : (toggleTarget?.activo ? t('admin.users.deactivate') : t('admin.users.activate'))}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsuarios;
