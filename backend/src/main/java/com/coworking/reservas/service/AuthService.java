package com.coworking.reservas.service;

import com.coworking.reservas.config.JwtService;
import com.coworking.reservas.config.UsuarioDetails;
import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.dto.AuthLoginRequest;
import com.coworking.reservas.dto.AuthResponse;
import com.coworking.reservas.dto.UsuarioResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements IAuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public AuthResponse autenticar(AuthLoginRequest authLoginRequest) {
        if (authLoginRequest.getCorreo() == null || authLoginRequest.getCorreo().trim().isEmpty()) {
            throw new BadCredentialsException("Debe enviar un correo valido");
        }

        if (authLoginRequest.getPassword() == null || authLoginRequest.getPassword().isEmpty()) {
            throw new BadCredentialsException("Debe enviar una contrasena valida");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authLoginRequest.getCorreo().trim().toLowerCase(),
                            authLoginRequest.getPassword()
                    )
            );

            UsuarioDetails usuarioDetails = (UsuarioDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(usuarioDetails);

            return new AuthResponse(
                    token,
                    "Bearer",
                    jwtService.getJwtExpirationMs() / 1000,
                    mapToResponse(usuarioDetails)
            );
        } catch (DisabledException ex) {
            throw ex;
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Credenciales invalidas");
        }
    }

    @Override
    public UsuarioResponse obtenerPerfilAutenticado(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario autenticado con ese correo"));

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getActivo(),
                usuario.getRol().getNombre(),
                usuario.getFechaRegistro()
        );
    }

    private UsuarioResponse mapToResponse(UsuarioDetails usuarioDetails) {
        return new UsuarioResponse(
                usuarioDetails.getId(),
                usuarioDetails.getNombre(),
                usuarioDetails.getCorreo(),
                usuarioDetails.isEnabled(),
                usuarioDetails.getRol(),
                usuarioDetails.getFechaRegistro()
        );
    }
}
