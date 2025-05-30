import { useEffect, useState } from 'react';
import { Modal, Form, Button, Tab, Tabs, Table } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';

export default function EditEventModalAssignments({ show, handleClose, eventData, refreshEvents, selectedDate, allEvents }) {
    const [key, setKey] = useState('customer');
    const [formData, setFormData] = useState({});
    const [functions, setFunctions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newFunction, setNewFunction] = useState({
        functionName: '',
        functionDateTime: '',
        assingTo: 'Me',
        assignToHandle: 'MeTo',
    });
    const [newTransaction, setNewTransaction] = useState({ receivedPayment: '', receivedDate: '', paymentNote: '' });
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customAssignmentName, setCustomAssignmentName] = useState('');

    const [editingFunction, setEditingFunction] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const token = JSON.parse(localStorage.getItem('camrilla_token'))?.accessToken;
    const uniqueAssignmentNames = [...new Set(allEvents.map(ev => ev.title))];

    useEffect(() => {
        if (eventData) {
            const dateObj = new Date(eventData.assignmentDateTime);
            setFormData({
                customerName: eventData.customerName || '',
                customerMobile: eventData.customerMobile || '',
                customerEmail: eventData.customerEmail || '',
                customerAddress: eventData.customerAddress || '',
                assignmentName: eventData.assignmentName || '',
                assignmentAddress: eventData.assignmentAddress || '',
                contactPerson1Mobile: eventData.contactPerson1Mobile || '',
                assignmentDate: dateObj.toISOString().split('T')[0],
                assignmentTime: dateObj.toTimeString().split(':').slice(0, 2).join(':'),
                assignToName: eventData.assignToName || 'Me',
                assignToHandle: eventData.assignToHandle || 'MeTo',
                assignmentNote: eventData.assignmentNote || '',
                totalAmount: eventData.totalAmount || 0,
            });
            setFunctions(eventData.functions || []);
            setTransactions(eventData.transactions || []);
            setShowOtherInput(eventData.assignmentName === 'Other');
        }
    }, [eventData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignmentChange = (e) => {
        if (e.target.value === 'other') {
            setShowOtherInput(true);
            setFormData(prev => ({ ...prev, assignmentName: '' }));
        } else {
            setShowOtherInput(false);
            setFormData(prev => ({ ...prev, assignmentName: e.target.value }));
        }
    };

    const handleUpdateAssignment = async () => {
        const dateTime = new Date(`${formData.assignmentDate}T${formData.assignmentTime}`).getTime();
        const payload = { ...formData, assignmentDateTime: dateTime, assignmentStatus: 'Completed', contactPerson1Name: '', contactPerson2Name: '', contactPerson2Mobile: '' };
        payload.assignmentName = showOtherInput ? customAssignmentName : payload.assignmentName;

        // , {
        //     headers: { Authorization: `Bearer ${token}` },
        // }

        try {
            await axios.put(`${config.BASE_URL}order/assignment/${eventData.id}`, payload);
            alert('Assignment updated');
            handleClose();
            refreshEvents(selectedDate);
        } catch (err) {
            console.error(err);
            alert('Error updating assignment');
        }
    };

    // , {
    //     headers: { Authorization: `Bearer ${token}` },
    // }
    const handleDeleteFunction = async (functionId) => {

        await axios.delete(`${config.BASE_URL}order/assignment/${eventData.id}/function/${functionId}`);
        // Update local state immediately to reflect deletion in the table
        setFunctions(prevFunctions => prevFunctions.filter(func => func.id !== functionId));
        alert("Function deleted successfully");
        refreshEvents(selectedDate);
    };

    const handleDeleteTransaction = async (transactionId) => {
        await axios.delete(`${config.BASE_URL}order/assignment/${eventData.id}/transaction/${transactionId}`);
        // , {
        //     headers: { Authorization: `Bearer ${token}` },
        // }
        setTransactions(prevTransactions => prevTransactions.filter(txn => txn.id !== transactionId));
        alert('Transaction deleted');
        refreshEvents(selectedDate);
    };

    const handleDeleteAssignment = async () => {
        if (!window.confirm('Delete this assignment?')) return;
        await axios.delete(`${config.BASE_URL}order/assignment/${eventData.id}`);
        alert('Assignment deleted');
        // , {
        //     headers: { Authorization: `Bearer ${token}` },
        // }
        handleClose();
        refreshEvents(selectedDate);
    };


    const handleAddOrUpdateFunction = async () => {
        const functionDateTime = new Date(newFunction.functionDateTime).getTime();
        try {
            if (editingFunction) {
                // Update existing function
                await axios.put(`${config.BASE_URL}order/assignment/${eventData.id}/function/${editingFunction.id}`, {
                    ...newFunction,
                    functionDateTime,
                });
                // , {
                //     headers: { Authorization: `Bearer ${token}` }
                // }
                setFunctions(prevFunctions =>
                    prevFunctions.map(func =>
                        func.id === editingFunction.id
                            ? { ...func, ...newFunction, functionDateTime }
                            : func
                    )
                );
                alert('Function updated');

            } else {
                // Add new function
                const response = await axios.post(`${config.BASE_URL}order/assignment/${eventData.id}/function`, {
                    ...newFunction,
                    functionDateTime,
                });
                // , {
                //     headers: { Authorization: `Bearer ${token}` }
                // }

                const apiData = response.data;

                // Fallback structure if API response is missing expected fields
                const newFunctionWithId = {
                    id: apiData?.id || Date.now(),
                    functionName: apiData?.functionName || newFunction.functionName,
                    functionDateTime: apiData?.functionDateTime || functionDateTime,
                    assingTo: apiData?.assingTo || newFunction.assingTo || 'Me',
                };

                setFunctions(prevFunctions => [...prevFunctions, newFunctionWithId]);

                // const newFunctionWithId = response.data || {
                //     ...newFunction,
                //     functionDateTime,
                //     id: Date.now() // Fallback ID if response doesn't include one
                // };

                // setFunctions(prevFunctions => [...prevFunctions, newFunctionWithId]);
                alert('Function added');
            }
            setNewFunction({ functionName: '', functionDateTime: '', assingTo: 'Me' });
            setEditingFunction(null);
            refreshEvents(selectedDate);
        } catch (error) {
            console.error(error);
            alert('Error while saving function');
        }
    };

    const handleEditFunction = (func) => {
        setNewFunction({
            functionName: func.functionName,
            functionDateTime: new Date(func.functionDateTime).toISOString().split('T')[0],
            assingTo: func.assingTo || 'Me'
        });
        setEditingFunction(func);
    };

    const handleAddOrUpdateTransaction = async () => {
        const receivedDate = new Date(newTransaction.receivedDate).getTime();
        try {
            if (editingTransaction) {
                await axios.put(`${config.BASE_URL}order/assignment/${eventData.id}/transaction/${editingTransaction.id}`, {
                    ...newTransaction,
                    receivedDate,
                });
                // , {
                //     headers: { Authorization: `Bearer ${token}` }
                // }
                // Update the local state to reflect changes in the table
                setTransactions(prevTransactions =>
                    prevTransactions.map(txn =>
                        txn.id === editingTransaction.id
                            ? { ...txn, ...newTransaction, receivedDate }
                            : txn
                    )
                );
                alert('Transaction updated');
            } else {
                const response = await axios.post(`${config.BASE_URL}order/assignment/${eventData.id}/transaction`, {
                    ...newTransaction,
                    receivedDate,
                });
                // , {
                //     headers: { Authorization: `Bearer ${token}` }
                // }

                // Assuming the API returns the created transaction with an ID

                // const newTransactionWithId = response.data || {
                //     ...newTransaction,
                //     receivedDate,
                //     id: Date.now() // Fallback ID if response doesn't include one
                // };
                const apiData = response.data;

                const newTransactionWithId = {
                    id: apiData?.id || Date.now(),
                    receivedPayment: apiData?.receivedPayment || newTransaction.receivedPayment || '—',
                    receivedDate: apiData?.receivedDate || receivedDate,
                    paymentNote: apiData?.paymentNote || newTransaction.paymentNote || '',
                };

                setTransactions(prevTransactions => [...prevTransactions, newTransactionWithId]);
                alert('Transaction added');
            }
            setNewTransaction({ receivedPayment: '', receivedDate: '', paymentNote: '' });
            setEditingTransaction(null);
            refreshEvents(selectedDate);
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

    const totalPaid = transactions.reduce((sum, txn) => sum + Number(txn.receivedPayment || 0), 0);
    const remaining = (formData.totalAmount || 0) - totalPaid;



    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static"  keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Assignment</Modal.Title>
                {/* <Button variant="danger" className="ms-3" onClick={handleDeleteAssignment}>Delete Assignment</Button> */}
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
                    <Tab eventKey="customer" title="Customer">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control name="customerName" value={formData.customerName} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile</Form.Label>
                                <Form.Control name="customerMobile" value={formData.customerMobile} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control name="customerAddress" value={formData.customerAddress} onChange={handleChange} />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignment" title="Assignment">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Assignment</Form.Label>
                                <Form.Select onChange={handleAssignmentChange} value={formData.assignmentName || ''}>
                                    <option disabled value="">-- Select Assignment --</option>
                                    {uniqueAssignmentNames.map((name, i) => (
                                        <option key={i} value={name}>{name}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            {showOtherInput && (
                                <Form.Group className="mb-3">
                                    <Form.Label>New Assignment Name</Form.Label>
                                    <Form.Control onChange={(e) => setCustomAssignmentName(e.target.value)} />
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control name="assignmentAddress" value={formData.assignmentAddress} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Alternate Contact</Form.Label>
                                <Form.Control name="contactPerson1Mobile" value={formData.contactPerson1Mobile} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control type="date" name="assignmentDate" value={formData.assignmentDate} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="time" name="assignmentTime" value={formData.assignmentTime} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={6}
                                    name="assignmentNote"
                                    value={formData.assignmentNote}
                                    onChange={handleChange}
                                    placeholder="Type your detailed note here..."
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Total Amount</Form.Label>
                                <Form.Control name="totalAmount" value={formData.totalAmount} onChange={handleChange} type="number" />
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="assignto" title="Assign To">
                        <Form>
                            <Form.Check
                                type="radio"
                                label="Me"
                                name="assignToName"
                                value="Me"
                                checked={formData.assignToName === 'Me'}
                                onChange={() =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: 'Me',
                                        assignToHandle: 'MeTo',
                                    }))
                                }
                            />
                            <Form.Check
                                type="radio"
                                label="Other"
                                name="assignToName"
                                value="Other"
                                checked={formData.assignToName === 'Other'}
                                onChange={() =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: 'Other',
                                        assignToHandle: prev.assignToHandle || '', // preserve if already typed
                                    }))
                                }
                            />
                            {formData.assignToName === 'Other' && (
                                <Form.Group className="mt-3">
                                    <Form.Label>Other Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.assignToHandle}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                assignToHandle: e.target.value,
                                            }))
                                        }
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    </Tab>
                    <Tab eventKey="functions" title="Functions">
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Function Name</th>
                                    <th>Date</th>
                                    <th>Assigned To</th>
                                    <th>Assigned Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {functions.map((func, idx) => (
                                    <tr key={idx}>
                                        <td>{func.functionName}</td>
                                        <td>{isNaN(new Date(func.functionDateTime)) ? 'Invalid date' : new Date(func.functionDateTime).toLocaleDateString()}</td>
                                        <td>{func.assingTo}</td>
                                        <td>{func.assignToHandle || '—'}</td>
                                        {/* <td><Button size="sm" variant="danger" onClick={() => handleDeleteFunction(func.id)}>Delete</Button></td> */}
                                        <td>
                                            <Button size="sm" variant="warning" onClick={() => handleEditFunction(func)}>Edit</Button>{' '}
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteFunction(func.id)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Function Name</Form.Label>
                                <Form.Control value={newFunction.functionName} onChange={(e) => setNewFunction({ ...newFunction, functionName: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Function Date</Form.Label>
                                <Form.Control type="date" value={newFunction.functionDateTime} onChange={(e) => setNewFunction({ ...newFunction, functionDateTime: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Assign To</Form.Label>
                                <Form.Check
                                    type="radio"
                                    label="Me"
                                    name="assingTo"
                                    value="Me"
                                    checked={newFunction.assingTo === 'Me'}
                                    onChange={() =>
                                        setNewFunction((prev) => ({
                                            ...prev,
                                            assingTo: 'Me',
                                            assignToHandle: 'MeTo',
                                        }))
                                    }
                                />
                                <Form.Check
                                    type="radio"
                                    label="Other"
                                    name="assingTo"
                                    value="Other"
                                    checked={newFunction.assingTo === 'Other'}
                                    onChange={() =>
                                        setNewFunction((prev) => ({
                                            ...prev,
                                            assingTo: 'Other',
                                            assignToHandle: '',
                                        }))
                                    }
                                />
                                {newFunction.assingTo === 'Other' && (
                                    <Form.Control
                                        className="mt-2"
                                        placeholder="Enter name"
                                        value={newFunction.assignToHandle}
                                        onChange={(e) =>
                                            setNewFunction((prev) => ({
                                                ...prev,
                                                assignToHandle: e.target.value,
                                            }))
                                        }
                                    />
                                )}
                            </Form.Group>
                            <Button variant="primary" onClick={handleAddOrUpdateFunction}>
                                {editingFunction ? "Update Function" : "Add Function"}
                            </Button>
                        </Form>
                    </Tab>
                    <Tab eventKey="transactions" title="Transactions">
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
                                        {/* <td><Button size="sm" variant="danger" onClick={() => handleDeleteTransaction(txn.id)}>Delete</Button></td> */}
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
                                <Form.Control value={formData.totalAmount || 0} disabled />
                                <Form.Text className="text-muted">
                                    Total Paid: ₹{totalPaid} | Remaining: ₹{remaining}
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Received Payment</Form.Label>
                                <Form.Control value={newTransaction.receivedPayment} onChange={(e) => setNewTransaction({ ...newTransaction, receivedPayment: e.target.value })} type="number" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Received Date</Form.Label>
                                <Form.Control type="date" value={newTransaction.receivedDate} onChange={(e) => setNewTransaction({ ...newTransaction, receivedDate: e.target.value })} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Payment Note</Form.Label>
                                <Form.Control value={newTransaction.paymentNote} onChange={(e) => setNewTransaction({ ...newTransaction, paymentNote: e.target.value })} />
                            </Form.Group>
                            {/* <Button variant="primary" onClick={handleAddTransaction}>Add Transaction</Button> */}
                            <Button variant="primary" onClick={handleAddOrUpdateTransaction}>
                                {editingTransaction ? "Update Transaction" : "Add Transaction"}
                            </Button>
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleUpdateAssignment}>Update Assignment</Button>
            </Modal.Footer>
        </Modal>
    );
}