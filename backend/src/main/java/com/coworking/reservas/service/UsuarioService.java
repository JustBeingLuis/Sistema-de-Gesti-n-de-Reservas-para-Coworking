package com.coworking.reservas.service;

import java.time.LocalDateTime;
import java.util.List;

import com.coworking.reservas.domain.Rol;
import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.RolOptionResponse;
import com.coworking.reservas.dto.UsuarioAdminListadoResponse;
import com.coworking.reservas.dto.UsuarioAdminRequest;
import com.coworking.reservas.dto.UsuarioAdminResponse;
import com.coworking.reservas.dto.UsuarioAdminSummaryResponse;
import com.coworking.reservas.dto.UsuarioRegistroRequest;
import com.coworking.reservas.dto.UsuarioResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.RolRepository;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService implements IUsuarioService {

    private static final int MAX_PAGE_SIZE = 24;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UsuarioResponse registrarUsuario(UsuarioRegistroRequest usuarioRegistroRequest) {
        validarSolicitud(usuarioRegistroRequest);

        String correoNormalizado = usuarioRegistroRequest.getCorreo().trim().toLowerCase();

        if (usuarioRepository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        Rol rolUsuario = rolRepository.findByNombreIgnoreCase("USER")
                .orElseThrow(() -> new ResourceNotFoundException("No existe el rol USER configurado en la base de datos"));

        Usuario usuario = new Usuario();
        usuario.setNombre(usuarioRegistroRequest.getNombre().trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setPassword(passwordEncoder.encode(usuarioRegistroRequest.getPassword()));
        usuario.setActivo(Boolean.TRUE);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario.setRol(rolUsuario);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return mapToResponse(usuarioGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioAdminListadoResponse consultarUsuariosParaAdministracion(int page, int size) {
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("activo"),
                        Sort.Order.desc("fechaRegistro"),
                        Sort.Order.asc("nombre")
                )
        );

        Page<UsuarioAdminResponse> usuarios = usuarioRepository.findAllBy(pageable)
                .map(this::mapToAdminResponse);

        UsuarioAdminSummaryResponse resumen = new UsuarioAdminSummaryResponse(
                usuarios.getTotalElements(),
                usuarioRepository.countByActivoTrue(),
                usuarioRepository.countByRolNombreIgnoreCase("ADMIN")
        );

        return new UsuarioAdminListadoResponse(PageResponse.from(usuarios), resumen);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioAdminResponse buscarUsuarioParaAdministracion(Long usuarioId) {
        if (usuarioId == null) {
            throw new IllegalArgumentException("El id del usuario es obligatorio.");
        }

        return mapToAdminResponse(buscarUsuarioPorId(usuarioId));
    }

    @Override
    public UsuarioAdminResponse actualizarUsuarioComoAdministrador(Long usuarioId, UsuarioAdminRequest usuarioAdminRequest,
                                                                  String correoAdminAutenticado) {
        if (usuarioId == null) {
            throw new IllegalArgumentException("El id del usuario es obligatorio.");
        }

        validarSolicitudAdmin(usuarioAdminRequest);

        Usuario usuario = buscarUsuarioPorId(usuarioId);
        String correoNormalizado = usuarioAdminRequest.getCorreo().trim().toLowerCase();

        usuarioRepository.findByCorreoIgnoreCase(correoNormalizado)
                .filter(usuarioExistente -> !usuarioExistente.getId().equals(usuarioId))
                .ifPresent(usuarioExistente -> {
                    throw new IllegalArgumentException("El correo ya se encuentra registrado por otro usuario.");
                });

        Rol rol = rolRepository.findById(usuarioAdminRequest.getRolId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un rol con el id " + usuarioAdminRequest.getRolId()
                ));

        validarProteccionAdminAutenticado(usuario, usuarioAdminRequest.getActivo(), rol.getNombre(), correoAdminAutenticado);

        usuario.setNombre(usuarioAdminRequest.getNombre().trim());
        usuario.setCorreo(correoNormalizado);
        usuario.setActivo(usuarioAdminRequest.getActivo());
        usuario.setRol(rol);

        return mapToAdminResponse(usuarioRepository.save(usuario));
    }

    @Override
    public UsuarioAdminResponse actualizarEstadoUsuario(Long usuarioId, Boolean activo, String correoAdminAutenticado) {
        if (usuarioId == null) {
            throw new IllegalArgumentException("El id del usuario es obligatorio.");
        }

        if (activo == null) {
            throw new IllegalArgumentException("Debes indicar si el usuario estara activo o inactivo.");
        }

        Usuario usuario = buscarUsuarioPorId(usuarioId);
        validarProteccionAdminAutenticado(usuario, activo, usuario.getRol().getNombre(), correoAdminAutenticado);
        usuario.setActivo(activo);

        return mapToAdminResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolOptionResponse> consultarRolesParaAdministracion() {
        return rolRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(rol -> new RolOptionResponse(rol.getId(), rol.getNombre()))
                .toList();
    }

    private void validarSolicitud(UsuarioRegistroRequest usuarioRegistroRequest) {
        if (usuarioRegistroRequest.getNombre() == null || usuarioRegistroRequest.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }

        if (usuarioRegistroRequest.getCorreo() == null || usuarioRegistroRequest.getCorreo().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es obligatorio");
        }

        if (usuarioRegistroRequest.getPassword() == null || usuarioRegistroRequest.getPassword().length() < 8) {
            throw new IllegalArgumentException("La contrasena debe tener minimo 8 caracteres");
        }
    }

    private void validarSolicitudAdmin(UsuarioAdminRequest usuarioAdminRequest) {
        if (usuarioAdminRequest.getNombre() == null || usuarioAdminRequest.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }

        if (usuarioAdminRequest.getCorreo() == null || usuarioAdminRequest.getCorreo().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es obligatorio.");
        }

        if (usuarioAdminRequest.getRolId() == null) {
            throw new IllegalArgumentException("Debes seleccionar un rol.");
        }

        if (usuarioAdminRequest.getActivo() == null) {
            throw new IllegalArgumentException("Debes indicar si el usuario esta activo.");
        }
    }

    private void validarPaginacion(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("El numero de pagina no puede ser negativo.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("El tamano de pagina debe estar entre 1 y " + MAX_PAGE_SIZE + ".");
        }
    }

    private Usuario buscarUsuarioPorId(Long usuarioId) {
        return usuarioRepository.findDetalleById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un usuario con el id " + usuarioId
                ));
    }

    private void validarProteccionAdminAutenticado(Usuario usuarioObjetivo, Boolean activo, String rolNombre,
                                                   String correoAdminAutenticado) {
        if (correoAdminAutenticado == null || correoAdminAutenticado.isBlank()) {
            return;
        }

        if (!usuarioObjetivo.getCorreo().equalsIgnoreCase(correoAdminAutenticado.trim())) {
            return;
        }

        if (!Boolean.TRUE.equals(activo)) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta de administrador.");
        }

        if (!"ADMIN".equalsIgnoreCase(rolNombre)) {
            throw new IllegalArgumentException("No puedes cambiar tu propio rol a un perfil distinto de ADMIN.");
        }
    }

    private UsuarioResponse mapToResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getActivo(),
                usuario.getRol().getNombre(),
                usuario.getFechaRegistro()
        );
    }

    private UsuarioAdminResponse mapToAdminResponse(Usuario usuario) {
        return new UsuarioAdminResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getActivo(),
                usuario.getRol().getId(),
                usuario.getRol().getNombre(),
                usuario.getFechaRegistro()
        );
    }
}
