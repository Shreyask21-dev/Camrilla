'use client';
import { useState, useEffect } from 'react';
import { Modal, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';

export default function TransactionModal({ show, handleClose, assignment, refresh }) {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({ receivedPayment: '', receivedDate: '', paymentNote: '' });
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        if (assignment) {
            setTransactions(assignment.transactions || []);
        }
    }, [assignment]);

    const handleAddOrUpdateTransaction = async () => {
        const token = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
        const receivedDate = new Date(newTransaction.receivedDate).getTime();

        try {
            if (editingTransaction) {
                await axios.put(`https://api.camrilla.com/order/assignment/${assignment.id}/transaction/${editingTransaction.id}`, {
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
                const response = await axios.post(`https://api.camrilla.com/order/assignment/${assignment.id}/transaction`, {
                    ...newTransaction,
                    receivedDate,
                });
                const apiData = response.data;

                const newTxn = {
                    id: apiData?.id || Date.now(),
                    receivedPayment: apiData?.receivedPayment || newTransaction.receivedPayment || '—',
                    receivedDate: apiData?.receivedDate || receivedDate,
                    paymentNote: apiData?.paymentNote || newTransaction.paymentNote || '',
                };
                setTransactions(prev => [...prev, newTxn]);
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
            receivedDate: new Date(txn.receivedDate).toISOString().split('T')[0],
            paymentNote: txn.paymentNote
        });
        setEditingTransaction(txn);
    };

    const handleDeleteTransaction = async (transactionId) => {
        await axios.delete(`https://api.camrilla.com/order/assignment/${assignment.id}/transaction/${transactionId}`);
        setTransactions(prev => prev.filter(txn => txn.id !== transactionId));
        alert('Transaction deleted');
        refresh();
    };

    const totalPaid = transactions.reduce((sum, txn) => sum + Number(txn.receivedPayment || 0), 0);
    const remaining = (assignment?.totalAmount || 0) - totalPaid;

    return (
        <Modal show={show} onHide={handleClose} size="lg">
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
                        {transactions.map((txn, idx) => (
                            <tr key={idx}>
                                <td>{txn.receivedPayment}</td>
                                <td>{txn.receivedDate && !isNaN(new Date(txn.receivedDate)) ? new Date(txn.receivedDate).toLocaleDateString() : '—'}</td>
                                <td>{txn.paymentNote}</td>
                                <td>
                                    <Button size="sm" variant="warning" onClick={() => handleEditTransaction(txn)}>Edit</Button>{' '}
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteTransaction(txn.id)}>Delete</Button>
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
                            value={newTransaction.receivedPayment}
                            onChange={(e) => setNewTransaction({ ...newTransaction, receivedPayment: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Received Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={newTransaction.receivedDate}
                            onChange={(e) => setNewTransaction({ ...newTransaction, receivedDate: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Payment Note</Form.Label>
                        <Form.Control
                            value={newTransaction.paymentNote}
                            onChange={(e) => setNewTransaction({ ...newTransaction, paymentNote: e.target.value })}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleAddOrUpdateTransaction}>
                        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
