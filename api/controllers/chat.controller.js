import messagesModel from '../../dao/models/messages.model.js';
import {io} from '../../app.js'

async function renderChat(req, res) {
  try {
    const messages = await messagesModel.find().sort('-timestamp');
    res.render('chat', { messages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los mensajes');
  }
}

async function saveMessage(req, res) {
  try {
    const { user, message } = req.body;

    // Guardar el mensaje en la base de datos
    const newMessage = new messagesModel({
      user,
      message
    });
    await newMessage.save();

    // Emitir el mensaje a través de socket.io
    res.render('chat message', newMessage);

    res.status(201).send('Mensaje enviado correctamente');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al enviar el mensaje');
  }
}

export default {
  renderChat,
  saveMessage
};

