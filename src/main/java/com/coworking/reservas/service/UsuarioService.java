package com.coworking.reservas.service;

import java.time.LocalDateTime;

import com.coworking.reservas.domain.Rol;
import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.dto.UsuarioRegistroRequest;
import com.coworking.reservas.dto.UsuarioResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.RolRepository;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsuarioService implements IUsuarioService {

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
}
