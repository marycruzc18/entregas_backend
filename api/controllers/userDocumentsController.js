
import  User  from '../../dao/models/user.model.js'; 

async function uploadUserDocuments(req, res) {
  try {
 
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron archivos' });
    }

    // Obtiene el usuario actual
    const { uid } = req.params;
    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

  
    user.documents = user.documents || [];
    user.documents.push(...req.files.map(file => ({ name: file.originalname, data: file.buffer })));

    await user.save();

    return res.status(200).json({ message: 'Documentos subidos exitosamente', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al subir documentos' });
  }
}

export { uploadUserDocuments };
