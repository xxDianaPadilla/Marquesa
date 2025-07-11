// Se crea un objeto vacío que servirá como controlador para la funcionalidad de logout (cerrar sesión)
const logoutController = {}; 

// Se define el método logout dentro del controlador, utilizando una función asíncrona
logoutController.logout = async (req, res) => {
  // Se limpia (elimina) la cookie llamada "authToken", lo que equivale a cerrar la sesión del usuario
  res.clearCookie("authToken");

  // Se responde al cliente con un código de estado 200 (OK) y un mensaje de confirmación en formato JSON
  res.status(200).json({ message: "Logged out successfully" });
};

// Se exporta el controlador para poder utilizarlo en otras partes de la aplicación
export default logoutController;