// components/SuccessModal.js
import { Modal, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function SuccessModal({ show, handleClose }) {
  const router = useRouter();

  const onClose = () => {
    handleClose();
    router.push('/');
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Congratulations!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="fs-5">You have successfully become a Professional user.</p>
        <p className="text-muted">Please enjoy and feel free to write us your feedback.</p>
        <Button variant="primary" onClick={onClose}>
          Go to Home
        </Button>
      </Modal.Body>
    </Modal>
  );
}
