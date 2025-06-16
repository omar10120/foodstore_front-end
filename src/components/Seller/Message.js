import { useState } from "react";

function  Message(){
    const [showComplaint, setShowComplaint] = useState({});
    const [complaints, setComplaints] = useState([
      { id: 1, content: "Complaint 1 content" },
      { id: 2, content: "Complaint 2 content" },
      { id: 3, content: "Complaint 3 content" },
    ]);
    const [modalData, setModalData] = useState({ recipient: '', message: '' });
  
    const toggleComplaint = (id) => {
      setShowComplaint((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };
  
    const handleButtonClick = (complaint) => {
      setModalData({ recipient: complaint.content, message: '' });
    };
  
    return (
      <>
        {complaints.map((complaint) => (
          <button
            key={complaint.id}
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            onClick={() => handleButtonClick(complaint)}
          >
            Open modal for Complaint {complaint.id}
          </button>
        ))}
  
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">New message</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="recipient-name" className="col-form-label">Recipient:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="recipient-name"
                      value={modalData.recipient}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message-text" className="col-form-label">Message:</label>
                    <textarea
                      className="form-control"
                      id="message-text"
                      value={modalData.message}
                      onChange={(e) => setModalData({ ...modalData, message: e.target.value })}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button className="btn btn-success"style={{height:'10px'}}>Send </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  

export default Message