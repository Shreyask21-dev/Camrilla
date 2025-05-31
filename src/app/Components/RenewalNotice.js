import { Modal, Button } from 'react-bootstrap';

export default function RenewalNotice({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Plan Renewal Reminder</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Your subscription is about to expire or recently expired.</p>
        <p>Please renew your plan to continue enjoying uninterrupted service.</p>
        <Button variant="primary" href="/Subscriptions" onClick={handleClose}>
          Renew Now
        </Button>
      </Modal.Body>
    </Modal>
  );
}
