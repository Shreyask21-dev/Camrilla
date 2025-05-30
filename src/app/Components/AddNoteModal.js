import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';

export default function AddNoteModal({ show, handleClose, assignmentData, refreshEvents }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (assignmentData) {
      setNote(assignmentData.assignmentNote || '');
    }
  }, [assignmentData]);

  const handleSave = async () => {
    const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
    const accessToken = tokenData?.accessToken;
    if (!accessToken) {
      alert('Access Token not found');
      return;
    }

    try {
      await axios.put(`${config.BASE_URL}order/assignment/${assignmentData.id}`, {
        customerName: assignmentData.customerName,
        customerMobile: assignmentData.customerMobile,
        customerEmail: assignmentData.customerEmail,
        customerAddress: assignmentData.customerAddress,
        assignmentAddress: assignmentData.assignmentAddress,
        assignmentName: assignmentData.assignmentName,
        assignmentDateTime: assignmentData.assignmentDateTime,
        assignmentStatus: assignmentData.assignmentStatus || "Completed",
        contactPerson1Name: assignmentData.contactPerson1Name || "",
        contactPerson1Mobile: assignmentData.contactPerson1Mobile || "",
        contactPerson2Name: assignmentData.contactPerson2Name || "",
        contactPerson2Mobile: assignmentData.contactPerson2Mobile || "",
        assignToName: assignmentData.assignToName || "Me",
        assignToHandle: assignmentData.assignToHandle || "MeTo",
        assignmentNote: note,
        totalAmount: assignmentData.totalAmount || 0,
        reminderBeforedays: assignmentData.reminderBeforedays || 0,
        reminderDate: assignmentData.reminderDate || ""
      });
      // , {
      //   headers: { Authorization: `Bearer ${accessToken}` }
      // }

      alert('Note updated successfully');
      handleClose();
      refreshEvents(); // refresh assignments
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}  backdrop="static"  keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add / Edit Note</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note here..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Note
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
