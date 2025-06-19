import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import config from "./config";

export async function getInfoUsuario() {
  const token = await SecureStore.getItemAsync("userToken");

  if (!token) return null;

  try {
    const response = await axios.post(`${config.BACKEND_URL_BASE}/usuarios/obtenerusuario`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}
