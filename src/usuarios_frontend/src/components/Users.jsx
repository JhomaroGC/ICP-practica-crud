import { useCanister, useConnect } from "@connect2ic/react";
import React, { useEffect, useState } from "react";
import Home from './Home'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const Messages = () => {

  const [messagesBackend] = useCanister("usuarios_backend");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState("");
  const [idMessage, setidMessage] = useState("");
  const [typeMessage, settypeMessage] = useState("");

  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  //Create new message
  const createMessage = async () => {

    const title = document.getElementById("title").value;
    const start = document.getElementById("start").value;
    const duration = document.getElementById("duration").value;
    const typeMsg = document.getElementById("typeMessage").value;
    setLoading("Loading...");
    await messagesBackend.createMessage(title, start, duration, typeMsg);
    setLoading("");
    setShowModalCrear(false);
    obtieneMessages();

  }

  const handleShowModalCrear = async () => {
    setShowModalCrear(true);
  }

  //update message


  const updateMessage = async () => {
    const title = document.getElementById("uptitle").value;
    const start = document.getElementById("upstart").value;
    const duration = document.getElementById("upduration").value;
    const typeMsg = document.getElementById("upTypeMessage").value;  
    setLoading("Loading...");

    await messagesBackend.updatemessage(idMessage, title, start, duration, typeMsg);
    setLoading("");
    setidMessage("")
    setShowModalEditar(false);
    obtieneMessages();
  }

  const handleShowModalEditar = async (idMessage) => {
    setShowModalEditar(true);
    setidMessage(idMessage)

    const message = await messagesBackend.readmessageById(idMessage);    
    document.getElementById("uptitle").value= message[0].title;
    document.getElementById("upstart").value = message[0].start;
    document.getElementById("upduration").value = message[0].typeMsg;
    document.getElementById("upTypeMessage").value = message[0].duration;

  }

  const deleteMessage = async (e) => {
    setLoading("Loading...");
    await messagesBackend.deletemessage(idMessage);
    setLoading("");
    setidMessage("")
    settypeMessage("")
    setShowModalEliminar(false);

    obtieneMessages()
  }
  const handleShowModalEliminar = async (idMessage, typeMessage) => {
    setShowModalEliminar(true);
    settypeMessage(typeMessage)
    setidMessage(idMessage)


  }

  const handleCloseModalCrear = () => setShowModalCrear(false);
  const handleCloseModalEditar = () => setShowModalEditar(false);
  const handleCloseModalEliminar = () => setShowModalEliminar(false);

  useEffect(() => {
    obtieneMessages();
  }, []);


  const obtieneMessages = async () => {
    setLoading("Loading...");
    try {
      var messagesRes = await messagesBackend.readmessages();
      messagesRes.sort(
        (msg1, msg2) => (msg1.start > msg2.start) ? 1 : (msg1.start < msg2.start) ? -1 : 0);

      setMessages(messagesRes);
      setLoading("");

    } catch (e) {
      console.log(e);
      setLoading("Error happened fetching messages list");
    }

  }




  return (
    <>

      <div className="row mt-5" >
        <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-2">
          <button type="button" className="btn btn-success" onClick={() => handleShowModalCrear()}>Crear Nuevo Mensaje</button>
        </div>
        <div className="col">
          {loading != ""
            ?
            <div className="alert alert-primary">{loading}</div>
            :
            <div></div>
          }
          <div className="card">
            <div className="card-header">
              Lista de mensajes

            </div>

            <div className="card-body">

              <table className="table">
                <thead>
                  <tr>
                    <th>Hora inicial</th>
                    <th>Título de Mensaje</th>
                    <th>Duración</th>
                    <th>Tipo Mensaje</th>
                    <th colSpan="2">Opciones Mensaje</th>
                  </tr>
                </thead>
                <tbody id="tbody">
                  {messages.map((message) => {
                    return (
                      <tr key={message.id}>
                        <td>{message.start}</td>
                        <td>{message.title}</td>
                        <td>{message.typeMsg}</td>
                        <td>{message.duration}</td>
                        <td>
                          <button type="button" className="btn btn-primary" onClick={() => handleShowModalEditar(`${message.id}`)}>Editar</button>
                        </td>
                        <td>
                          <button type="button" className="btn btn-danger" onClick={() => handleShowModalEliminar(`${message.id}`, `${message.start} - ${message.title}`)}>Eliminar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
{/* Form to create messages*/}
        <Modal show={showModalCrear} onHide={handleCloseModalCrear}>
          <Modal.Header closeButton>
            <Modal.Title>Crear nuevo Mensaje</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="card">
              <div className="card-body">
                {loading != ""
                  ?
                  <div className="alert alert-primary">{loading}</div>
                  :
                  <div></div>
                }
                <form style={{ display: "inline" }} id="formCrear" >
                  <div className="form-group">
                    <label htmlFor="title" >Título Mensaje</label>
                    <input type="text" className="form-control" id="title" placeholder="Título mensaje" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="start" >Hora inicial</label>
                    <input type="text" className="form-control" id="start" placeholder="hh:mm" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration" >Duración</label>
                    <input type="text" className="form-control" id="duration" placeholder="40" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="typeMessage" >Tipo de Mensaje</label>
                    <input type="text" className="form-control" id="typeMessage" placeholder="interno" />
                  </div>
                  <br />
                </form>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalCrear}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={createMessage}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
{/* Form updating messages*/}
        <Modal show={showModalEditar} onHide={handleCloseModalEditar}>
          <Modal.Header closeButton>
            <Modal.Title>Actualizar Mensaje</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="card">
              <div className="card-body">
                {loading != ""
                  ?
                  <div className="alert alert-primary">{loading}</div>
                  :
                  <div></div>
                }
                <form style={{ display: "inline" }} id="formEditar" >
                  <div className="form-group">
                    <label htmlFor="title" >Título Mensaje</label>
                    <input type="text" className="form-control" id="uptitle" placeholder="Título del mensaje" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="start" >Hora inicial</label>
                    <input type="text" className="form-control" id="upstart" placeholder="hh:mm" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration" >Duración</label>
                    <input type="text" className="form-control" id="upduration" placeholder="40" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="typeMessage" >Tipo de Mensaje</label>
                    <input type="text" className="form-control" id="upTypeMessage" placeholder="interno" />
                  </div>
                  <br />
                </form>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalEditar}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={updateMessage}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
{/* Form delete message */}
        <Modal show={showModalEliminar} onHide={handleCloseModalEliminar}>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar Mensaje</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="card">
              <div className="card-body">
                {loading != ""
                  ?
                  <div className="alert alert-primary">{loading}</div>
                  :
                  <div></div>
                }
                <p> ¿ Deseas eliminar  "{typeMessage}" de la lista?</p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModalEliminar}>
              Cerrar
            </Button>
            <Button variant="danger" onClick={deleteMessage}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

    </>
  )
}


export default Messages