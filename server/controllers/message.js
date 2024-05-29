import Message from "../models/message.js";

var controller = {
  save: async (req, res) => {
    var params = req.body;

    if (!params.message || !params.from) {
      return res.status(400).send({
        status: "error",
        message: "No ha sido posible guardar el mensaje",
      });
    }

    try {
      var message = new Message({
        message: params.message,
        from: params.from,
      });

      const messageStored = await message.save();
      return res.status(200).send({
        status: "success",
        messageStored,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "No se guardó tu mensaje",
      });
    }
  },

  getMessages: async (req, res) => {
    try {
      const messages = await Message.find({}).sort('-_id');
      if (!messages.length) {
        return res.status(404).send({
          status: "error",
          message: "No hay mensajes",
        });
      }

      return res.status(200).send({
        status: "success",
        messages,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al mostrar mensajes",
      });
    }
  },
};

export default controller;
