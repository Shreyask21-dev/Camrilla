import { useEffect, useState } from 'react';
import { Modal, Form, Button, Tab, Tabs, Table } from 'react-bootstrap';
import axios from 'axios';
import config from '../config/config';
import { useAssignmentStore } from '../store/store';

export default function EditEventModalAssignments({
    show,
    handleClose,
    eventData,
    refreshEvents,
    selectedDate,
    allEvents
}) {

    const { decrementAssignmentCount } = useAssignmentStore();

    const [key, setKey] = useState('customer');

    // ---------- Prevent uncontrolled input ----------
    const safe = (v, fallback = "") => (v === undefined || v === null ? fallback : v);

    const [formData, setFormData] = useState({
        customerName: "",
        customerMobile: "",
        customerEmail: "",
        customerAddress: "",
        assignmentName: "",
        assignmentAddress: "",
        contactPerson1Mobile: "",
        assignmentDate: "",
        assignmentTime: "",
        assignToName: "Me",
        assignToHandle: "MeTo",
        assignmentNote: "",
        totalAmount: 0
    });

    const [functions, setFunctions] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [newFunction, setNewFunction] = useState({
        functionName: "",
        functionDateTime: "",
        assingTo: "Me",
        assignToHandle: "MeTo"
    });

    const [newTransaction, setNewTransaction] = useState({
        receivedPayment: "",
        receivedDate: "",
        paymentNote: ""
    });

    const [showOtherInput, setShowOtherInput] = useState(false);
    const [customAssignmentName, setCustomAssignmentName] = useState("");

    const [editingFunction, setEditingFunction] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const token = JSON.parse(localStorage.getItem("camrilla_token"))?.accessToken;
    const uniqueAssignmentNames = [...new Set(allEvents.map(ev => ev.title))];

    // ------------ Load event data safely -------------
    useEffect(() => {
        if (eventData) {
            const dateObj = new Date(eventData.assignmentDateTime);

            setFormData({
                customerName: safe(eventData.customerName),
                customerMobile: safe(eventData.customerMobile),
                customerEmail: safe(eventData.customerEmail),
                customerAddress: safe(eventData.customerAddress),
                assignmentName: safe(eventData.assignmentName),
                assignmentAddress: safe(eventData.assignmentAddress),
                contactPerson1Mobile: safe(eventData.contactPerson1Mobile),
                assignmentDate: dateObj.toISOString().split("T")[0],
                assignmentTime: dateObj.toTimeString().slice(0, 5),
                assignToName: safe(eventData.assignToName, "Me"),
                assignToHandle: safe(eventData.assignToHandle, "MeTo"),
                assignmentNote: safe(eventData.assignmentNote),
                totalAmount: safe(eventData.totalAmount, 0)
            });

            setFunctions(Array.isArray(eventData.functions) ? eventData.functions : []);
            setTransactions(Array.isArray(eventData.transactions) ? eventData.transactions : []);

            setShowOtherInput(eventData.assignmentName === "Other");
        }
    }, [eventData]);

    // ------------ Handle Change -------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ------------ Assignment selector -------------
    const handleAssignmentChange = (e) => {
        if (e.target.value === "other") {
            setShowOtherInput(true);
            setFormData(prev => ({ ...prev, assignmentName: "" }));
        } else {
            setShowOtherInput(false);
            setFormData(prev => ({ ...prev, assignmentName: e.target.value }));
        }
    };

    // ------------ Update Assignment API -------------
    const handleUpdateAssignment = async () => {
        const dateTime = new Date(`${formData.assignmentDate}T${formData.assignmentTime}`).getTime();

        const payload = {
            ...formData,
            assignmentDateTime: dateTime,
            assignmentName: showOtherInput ? customAssignmentName : formData.assignmentName,
            assignmentStatus: "Completed",
            contactPerson1Name: "",
            contactPerson2Name: "",
            contactPerson2Mobile: ""
        };

        try {
            await axios.put(`${config.BASE_URL}order/assignment/${eventData.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert("Assignment updated");
            handleClose();
            refreshEvents(selectedDate);
        } catch (err) {
            console.error(err);
            alert("Error updating assignment");
        }
    };
    // ------------- Delete Function -------------
    const handleDeleteFunction = async (functionId) => {
        if (!functionId) return alert("Invalid function ID");

        try {
            await axios.delete(`${config.BASE_URL}order/assignment/${eventData.id}/function/${functionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFunctions(prev => prev.filter(f => f.id !== functionId));
            alert("Function deleted");
            refreshEvents(selectedDate);
        } catch (err) {
            console.error(err);
            alert("Failed to delete function");
        }
    };

    // ------------- Delete Transaction -------------
   const handleDeleteTransaction = async (transactionId) => {
    if (!transactionId) return alert("Invalid transaction ID");

    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return; // User cancelled deletion

    try {
        await axios.delete(
            `${config.BASE_URL}order/assignment/${eventData.id}/transaction/${transactionId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        alert("Transaction deleted successfully");
        refreshEvents(selectedDate);
    } catch (err) {
        console.error(err);
        alert("Failed to delete transaction");
    }
};


    // ------------- Add or Update Function -------------
    const handleAddOrUpdateFunction = async () => {
        if (!newFunction.functionName.trim()) return alert("Function name required");
        if (!newFunction.functionDateTime) return alert("Function date required");

        const functionDateTime = new Date(newFunction.functionDateTime).getTime();

        try {
            if (editingFunction) {
                // Update
                await axios.put(
                    `${config.BASE_URL}order/assignment/${eventData.id}/function/${editingFunction.id}`,
                    { ...newFunction, functionDateTime },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setFunctions(prev =>
                    prev.map(func =>
                        func.id === editingFunction.id
                            ? { ...func, ...newFunction, functionDateTime }
                            : func
                    )
                );

                alert("Function updated");
            } else {
                // Add
                const response = await axios.post(
                    `${config.BASE_URL}order/assignment/${eventData.id}/function`,
                    { ...newFunction, functionDateTime },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const apiData = response.data;

                const newFunc = {
                    id: apiData?.id || Date.now(),
                    functionName: apiData?.functionName || newFunction.functionName,
                    functionDateTime: apiData?.functionDateTime || functionDateTime,
                    assingTo: apiData?.assingTo || newFunction.assingTo,
                    assignToHandle: apiData?.assignToHandle || newFunction.assignToHandle
                };

                setFunctions(prev => [...prev, newFunc]);
                alert("Function added");
            }

            setNewFunction({ functionName: "", functionDateTime: "", assingTo: "Me", assignToHandle: "MeTo" });
            setEditingFunction(null);
            refreshEvents(selectedDate);
        } catch (err) {
            console.error(err);
            alert("Error saving function");
        }
    };

    // ------------- Edit Function -------------
    const handleEditFunction = (func) => {
        setNewFunction({
            functionName: func.functionName,
            functionDateTime: new Date(func.functionDateTime).toISOString().split("T")[0],
            assingTo: func.assingTo || "Me",
            assignToHandle: func.assignToHandle || ""
        });

        setEditingFunction(func);
    };

    // ------------- Add / Update Transaction -------------
    const handleAddOrUpdateTransaction = async () => {
        if (!newTransaction.receivedPayment) return alert("Payment amount required");
        if (!newTransaction.receivedDate) return alert("Received date required");

        const receivedDate = new Date(newTransaction.receivedDate).getTime();

        try {
            if (editingTransaction) {
                // UPDATE Transaction
                await axios.put(
                    `${config.BASE_URL}order/assignment/${eventData.id}/transaction/${editingTransaction.id}`,
                    { ...newTransaction, receivedDate },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setTransactions(prev =>
                    prev.map(txn =>
                        txn.id === editingTransaction.id
                            ? { ...txn, ...newTransaction, receivedDate }
                            : txn
                    )
                );

                alert("Transaction updated");
            } else {
                // ADD New Transaction
                const response = await axios.post(
                    `${config.BASE_URL}order/assignment/${eventData.id}/transaction`,
                    { ...newTransaction, receivedDate },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const apiData = response.data;

                const newTxn = {
                    id: apiData?.id || Date.now(),
                    receivedPayment: apiData?.receivedPayment || newTransaction.receivedPayment,
                    receivedDate: apiData?.receivedDate || receivedDate,
                    paymentNote: apiData?.paymentNote || newTransaction.paymentNote
                };

                setTransactions(prev => [...prev, newTxn]);
                alert("Transaction added");
            }

            setNewTransaction({ receivedPayment: "", receivedDate: "", paymentNote: "" });
            setEditingTransaction(null);
            refreshEvents(selectedDate);
        } catch (err) {
            console.error(err);
            alert("Error saving transaction");
        }
    };

    // ------------- Edit Transaction -------------
    const handleEditTransaction = (txn) => {
        setNewTransaction({
            receivedPayment: safe(txn.receivedPayment),
            receivedDate: new Date(txn.receivedDate).toISOString().split("T")[0],
            paymentNote: safe(txn.paymentNote)
        });

        setEditingTransaction(txn);
    };

    // ------------- Totals -------------
    const totalPaid = transactions.reduce((sum, t) => sum + Number(t.receivedPayment || 0), 0);
    const remaining = (formData.totalAmount || 0) - totalPaid;

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Assignment</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
                    
                    {/* CUSTOMER TAB */}
                    <Tab eventKey="customer" title="Customer">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    name="customerName"
                                    value={safe(formData.customerName)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mobile</Form.Label>
                                <Form.Control
                                    name="customerMobile"
                                    value={safe(formData.customerMobile)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    name="customerEmail"
                                    value={safe(formData.customerEmail)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    name="customerAddress"
                                    value={safe(formData.customerAddress)}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Form>
                    </Tab>

                    {/* ASSIGNMENT TAB */}
                    <Tab eventKey="assignment" title="Assignment">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Assignment</Form.Label>
                                <Form.Select
                                    onChange={handleAssignmentChange}
                                    value={safe(formData.assignmentName)}
                                >
                                    <option value="">-- Select Assignment --</option>
                                    {uniqueAssignmentNames.map((name, idx) => (
                                        <option key={idx} value={name}>{name}</option>
                                    ))}
                                    <option value="other">Other</option>
                                </Form.Select>
                            </Form.Group>

                            {showOtherInput && (
                                <Form.Group className="mb-3">
                                    <Form.Label>New Assignment Name</Form.Label>
                                    <Form.Control
                                        value={customAssignmentName}
                                        onChange={(e) => setCustomAssignmentName(e.target.value)}
                                    />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control
                                    name="assignmentAddress"
                                    value={safe(formData.assignmentAddress)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Alternate Contact</Form.Label>
                                <Form.Control
                                    name="contactPerson1Mobile"
                                    value={safe(formData.contactPerson1Mobile)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="assignmentDate"
                                    value={safe(formData.assignmentDate)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="assignmentTime"
                                    value={safe(formData.assignmentTime)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Note</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="assignmentNote"
                                    value={safe(formData.assignmentNote)}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Total Amount</Form.Label>
                                <Form.Control
                                    name="totalAmount"
                                    type="number"
                                    value={safe(formData.totalAmount, 0)}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Form>
                    </Tab>

                    {/* ASSIGN TO TAB */}
                    <Tab eventKey="assignto" title="Assign To">
                        <Form>
                            <Form.Check
                                type="radio"
                                label="Me"
                                name="assignToName"
                                value="Me"
                                checked={formData.assignToName === "Me"}
                                onChange={() =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: "Me",
                                        assignToHandle: "MeTo"
                                    }))
                                }
                            />

                            <Form.Check
                                type="radio"
                                label="Other"
                                name="assignToName"
                                value="Other"
                                checked={formData.assignToName === "Other"}
                                onChange={() =>
                                    setFormData(prev => ({
                                        ...prev,
                                        assignToName: "Other",
                                        assignToHandle: safe(prev.assignToHandle, "")
                                    }))
                                }
                            />

                            {formData.assignToName === "Other" && (
                                <Form.Group className="mt-2">
                                    <Form.Label>Other Name</Form.Label>
                                    <Form.Control
                                        value={safe(formData.assignToHandle)}
                                        onChange={(e) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                assignToHandle: e.target.value
                                            }))
                                        }
                                    />
                                </Form.Group>
                            )}
                        </Form>
                    </Tab>

                    {/* FUNCTIONS TAB */}
                    <Tab eventKey="functions" title="Functions">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Assigned To</th>
                                    <th>Handle</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {functions.map((func, idx) => (
                                    <tr key={idx}>
                                        <td>{func.functionName}</td>
                                        <td>{new Date(func.functionDateTime).toLocaleDateString()}</td>
                                        <td>{func.assingTo}</td>
                                        <td>{func.assignToHandle || "—"}</td>
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
                                <Form.Control
                                    value={safe(newFunction.functionName)}
                                    onChange={(e) =>
                                        setNewFunction(prev => ({ ...prev, functionName: e.target.value }))
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={safe(newFunction.functionDateTime)}
                                    onChange={(e) =>
                                        setNewFunction(prev => ({ ...prev, functionDateTime: e.target.value }))
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Assign To</Form.Label>

                                <Form.Check
                                    type="radio"
                                    label="Me"
                                    name="assingTo"
                                    checked={newFunction.assingTo === "Me"}
                                    onChange={() =>
                                        setNewFunction(prev => ({
                                            ...prev,
                                            assingTo: "Me",
                                            assignToHandle: "MeTo"
                                        }))
                                    }
                                />

                                <Form.Check
                                    type="radio"
                                    label="Other"
                                    name="assingTo"
                                    checked={newFunction.assingTo === "Other"}
                                    onChange={() =>
                                        setNewFunction(prev => ({
                                            ...prev,
                                            assingTo: "Other",
                                            assignToHandle: ""
                                        }))
                                    }
                                />

                                {newFunction.assingTo === "Other" && (
                                    <Form.Control
                                        className="mt-2"
                                        placeholder="Enter name"
                                        value={safe(newFunction.assignToHandle)}
                                        onChange={(e) =>
                                            setNewFunction(prev => ({
                                                ...prev,
                                                assignToHandle: e.target.value
                                            }))
                                        }
                                    />
                                )}
                            </Form.Group>

                            <Button onClick={handleAddOrUpdateFunction} variant="primary">
                                {editingFunction ? "Update Function" : "Add Function"}
                            </Button>
                        </Form>
                    </Tab>

                    {/* TRANSACTIONS TAB */}
                    <Tab eventKey="transactions" title="Transactions">
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Note</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((txn, idx) => (
                                    <tr key={idx}>
                                        <td>{txn.receivedPayment}</td>
                                        <td>{txn.receivedDate ? new Date(txn.receivedDate).toLocaleDateString() : "—"}</td>
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
                                <Form.Control value={formData.totalAmount} disabled />
                                <small className="text-muted">
                                    Paid: ₹{totalPaid} | Remaining: ₹{remaining}
                                </small>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Payment Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={safe(newTransaction.receivedPayment)}
                                    onChange={(e) =>
                                        setNewTransaction(prev => ({
                                            ...prev,
                                            receivedPayment: e.target.value
                                        }))
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Received Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={safe(newTransaction.receivedDate)}
                                    onChange={(e) =>
                                        setNewTransaction(prev => ({
                                            ...prev,
                                            receivedDate: e.target.value
                                        }))
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Payment Note</Form.Label>
                                <Form.Control
                                    value={safe(newTransaction.paymentNote)}
                                    onChange={(e) =>
                                        setNewTransaction(prev => ({
                                            ...prev,
                                            paymentNote: e.target.value
                                        }))
                                    }
                                />
                            </Form.Group>

                            <Button onClick={handleAddOrUpdateTransaction} variant="primary">
                                {editingTransaction ? "Update Transaction" : "Add Transaction"}
                            </Button>
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>

                <Button variant="primary" onClick={handleUpdateAssignment}>
                    Update Assignment
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
