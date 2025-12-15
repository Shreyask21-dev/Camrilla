'use client';
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';

export default function TransactionModal({ show, handleClose, assignment, refresh }) {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    receivedPayment: '',
    receivedDate: '',
    paymentNote: '',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [errors, setErrors] = useState({}); // ✅ for validation messages

  useEffect(() => {
    if (assignment) {
      setTransactions(assignment.transactions || []);
    }
  }, [assignment]);

  const validateTransaction = () => {
    const errs = {};
    const rawAmount = newTransaction.receivedPayment;
    const amount = Number(rawAmount);

    if (rawAmount === '' || isNaN(amount)) {
      errs.receivedPayment = 'Please enter a valid amount.';
    } else if (amount < 0) {
      // ✅ main requirement
      errs.receivedPayment = 'Received Payment cannot be negative.';
    }

    if (!newTransaction.receivedDate) {
      errs.receivedDate = 'Please select a received date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

 const handleAddOrUpdateTransaction = async () => {
    const token = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
    const receivedDate = new Date(newTransaction.receivedDate).getTime();

    // 🚫 Validation — Block if any field is empty
    if (!newTransaction.receivedPayment || Number(newTransaction.receivedPayment) <= 0) {
        alert("Received Payment must be greater than 0");
        return;
    }
    if (!newTransaction.receivedDate) {
        alert("Received Date is required");
        return;
    }
    if (!newTransaction.paymentNote.trim()) {
        alert("Payment Note cannot be blank");
        return;
    }

    try {
        if (editingTransaction) {
            await axios.put(`${config.BASE_URL}order/assignment/${assignment.id}/transaction/${editingTransaction.id}`, {
                ...newTransaction,
                receivedDate,
            });
            setTransactions(prev =>
                prev.map(txn =>
                    txn.id === editingTransaction.id
                        ? { ...txn, ...newTransaction, receivedDate }
                        : txn
                )
            );
            alert('Transaction updated');
        } else {
            const response = await axios.post(`${config.BASE_URL}order/assignment/${assignment.id}/transaction`, {
                ...newTransaction,
                receivedDate,
            });

            setTransactions(prev => [...prev, {
                id: response.data?.id || Date.now(),
                receivedPayment: newTransaction.receivedPayment,
                receivedDate,
                paymentNote: newTransaction.paymentNote,
            }]);

            alert('Transaction added');
        }

        setNewTransaction({ receivedPayment: '', receivedDate: '', paymentNote: '' });
        setEditingTransaction(null);
        refresh();
    } catch (error) {
        console.error(error);
        alert('Error while saving transaction');
    }
};

  const handleEditTransaction = (txn) => {
    setNewTransaction({
      receivedPayment: txn.receivedPayment,
      receivedDate: txn.receivedDate
        ? new Date(txn.receivedDate).toISOString().split('T')[0]
        : '',
      paymentNote: txn.paymentNote || '',
    });
    setEditingTransaction(txn);
    setErrors({});
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(
        `${config.BASE_URL}order/assignment/${assignment.id}/transaction/${transactionId}`
      );
      setTransactions((prev) => prev.filter((txn) => txn.id !== transactionId));
      alert('Transaction deleted');
      refresh();
    } catch (err) {
      console.error(err);
      alert('Error deleting transaction');
    }
  };

  const totalPaid = transactions.reduce(
    (sum, txn) => sum + Number(txn.receivedPayment || 0),
    0
  );
  const remaining = (assignment?.totalAmount || 0) - totalPaid;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Manage Transactions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Payment Amount</th>
              <th>Received Date</th>
              <th>Payment Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.receivedPayment}</td>
                <td>
                  {txn.receivedDate && !isNaN(new Date(txn.receivedDate))
                    ? new Date(txn.receivedDate).toLocaleDateString()
                    : '—'}
                </td>
                <td>{txn.paymentNote}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleEditTransaction(txn)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteTransaction(txn.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Total Amount</Form.Label>
            <Form.Control value={assignment?.totalAmount || 0} disabled />
            <Form.Text className="text-muted">
              Total Paid: ₹{totalPaid} | Remaining: ₹{remaining}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Received Payment</Form.Label>
            <Form.Control
              type="number"
              min="0" // ✅ browser-level guard
              step="0.01"
              value={newTransaction.receivedPayment}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  receivedPayment: e.target.value,
                })
              }
            />
            {errors.receivedPayment && (
              <div className="text-danger small mt-1">
                {errors.receivedPayment}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Received Date</Form.Label>
            <Form.Control
              type="date"
              value={newTransaction.receivedDate}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  receivedDate: e.target.value,
                })
              }
            />
            {errors.receivedDate && (
              <div className="text-danger small mt-1">
                {errors.receivedDate}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Note</Form.Label>
            <Form.Control
              value={newTransaction.paymentNote}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  paymentNote: e.target.value,
                })
              }
            />
          </Form.Group>

          <Button variant="primary" onClick={handleAddOrUpdateTransaction}>
            {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
