import axios from "axios";

export async function getInfoUsuario() {
  const email = "maria.gonzalez@example.com";

  try {
    const response = await axios.post("http://localhost:4000/usuarios/obtenerusuario", {
      correo: email,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

