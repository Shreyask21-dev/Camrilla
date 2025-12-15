import { useEffect, useState } from "react";
import { Modal, Form, Button, Tab, Tabs, Table } from "react-bootstrap";
import axios from "axios";
import config from "../config/config";
import { useAssignmentStore } from "../store/store";

export default function EditEventModalAssignments({
  show,
  handleClose,
  eventData,
  refreshEvents,
  selectedDate,
  allEvents,
}) {
  const { decrementAssignmentCount } = useAssignmentStore();

  const [key, setKey] = useState("customer");

  // ---------- Prevent uncontrolled input ----------
  const safe = (v, fallback = "") =>
    v === undefined || v === null ? fallback : v;

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
    totalAmount: 0,
  });

  const [functions, setFunctions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [newFunction, setNewFunction] = useState({
    functionName: "",
    functionDateTime: "",
    assingTo: "Me",
    assignToHandle: "MeTo",
  });

  const [newTransaction, setNewTransaction] = useState({
    receivedPayment: "",
    receivedDate: "",
    paymentNote: "",
  });

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customAssignmentName, setCustomAssignmentName] = useState("");

  const [editingFunction, setEditingFunction] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const token = JSON.parse(localStorage.getItem("camrilla_token"))?.accessToken;
  const uniqueAssignmentNames = [...new Set(allEvents.map((ev) => ev.title))];

  // ---------- Validation state ----------
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        totalAmount: safe(eventData.totalAmount, 0),
      });

      setFunctions(
        Array.isArray(eventData.functions) ? eventData.functions : []
      );
      setTransactions(
        Array.isArray(eventData.transactions) ? eventData.transactions : []
      );

      setShowOtherInput(eventData.assignmentName === "Other");
      setCustomAssignmentName(eventData.assignmentName === "Other" ? "" : "");
      setErrors({});
    }
  }, [eventData]);

  // ------------ Handle Change -------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    // if number input for totalAmount, keep as number
    const val =
      name === "totalAmount" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  // ------------ Field validation helpers -------------
  const validateField = (name, value) => {
    let msg = "";

    const v = value === undefined ? formData[name] : value;

    switch (name) {
      case "customerName":
        if (!v || !String(v).trim()) msg = "Customer name required";
        break;
      case "customerMobile":
        if (!v || !String(v).trim()) msg = "Customer mobile required";
        break;
      case "customerEmail":
        if (!v || !String(v).trim()) msg = "Customer email required";
        else if (!emailRegex.test(String(v).trim())) msg = "Invalid email";
        break;
      case "customerAddress":
        if (!v || !String(v).trim()) msg = "Customer address required";
        break;
      case "assignmentName":
        if (!showOtherInput && (!v || !String(v).trim()))
          msg = "Assignment name required";
        break;
      case "assignmentAddress":
        if (!v || !String(v).trim()) msg = "Assignment address required";
        break;
      case "contactPerson1Mobile":
        if (!v || !String(v).trim()) msg = "Alternate contact required";
        break;
      case "assignmentDate":
        if (!v) msg = "Assignment date required";
        break;
      case "assignmentTime":
        if (!v) msg = "Assignment time required";
        break;
      case "assignmentNote":
        if (!v || !String(v).trim()) msg = "Assignment note required";
        break;
      case "totalAmount":
        if (v === "" || v === null || isNaN(Number(v)) || Number(v) <= 0)
          msg = "Total amount must be > 0";
        break;
      case "assignToHandle":
        // 🔴 Validate only if "Other" is selected
        if (formData.assignToName === "Other") {
          if (!v || !String(v).trim()) {
            msg = "Assigned to name required";
          }
        }
        break;
      default:
        msg = "";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  const validateForm = () => {
    const requiredFields = [
      "customerName",
      "customerMobile",
      "customerEmail",
      "customerAddress",
      "assignmentName",
      "assignmentAddress",
      "contactPerson1Mobile",
      "assignmentDate",
      "assignmentTime",
      "assignmentNote",
      "totalAmount",
    ];

    let valid = true;

    requiredFields.forEach((f) => {
      // If assignmentName is "Other", check customAssignmentName separately
      if (f === "assignmentName" && showOtherInput) {
        if (!customAssignmentName || !String(customAssignmentName).trim()) {
          setErrors((prev) => ({
            ...prev,
            customAssignmentName: "Assignment name required",
          }));
          valid = false;
        } else {
          setErrors((prev) => ({ ...prev, customAssignmentName: "" }));
        }
      } else {
        const ok = validateField(f);
        if (!ok) valid = false;
      }
    });

    // 🔴 Extra: Assign To = Other must have name
    if (formData.assignToName === "Other") {
      const okAssign = validateField("assignToHandle", formData.assignToHandle);
      if (!okAssign) valid = false;
    }

    return valid;
  };

  // ------------ Assignment selector -------------
  const handleAssignmentChange = (e) => {
    if (e.target.value === "other") {
      setShowOtherInput(true);
      setFormData((prev) => ({ ...prev, assignmentName: "" }));
      setErrors((prev) => ({
        ...prev,
        assignmentName: "Assignment name required",
      }));
    } else {
      setShowOtherInput(false);
      setFormData((prev) => ({ ...prev, assignmentName: e.target.value }));
      setErrors((prev) => ({ ...prev, assignmentName: "" }));
      setCustomAssignmentName("");
      setErrors((prev) => ({ ...prev, customAssignmentName: "" }));
    }
  };

  // ------------ Update Assignment API -------------
 const handleUpdateAssignment = async () => {
  if (!validateForm()) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const dateTime = new Date(
    `${formData.assignmentDate}T${formData.assignmentTime}`
  ).getTime();

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
    await axios.put(
      `${config.BASE_URL}order/assignment/${eventData.id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
      await axios.delete(
        `${config.BASE_URL}order/assignment/${eventData.id}/function/${functionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFunctions((prev) => prev.filter((f) => f.id !== functionId));
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

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (!confirmDelete) return; // User cancelled deletion

    try {
      await axios.delete(
        `${config.BASE_URL}order/assignment/${eventData.id}/transaction/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
      alert("Transaction deleted successfully");
      refreshEvents(selectedDate);
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction");
    }
  };

  // ------------- Add or Update Function -------------
  const handleAddOrUpdateFunction = async () => {
    // Inline validation for function
    if (!newFunction.functionName || !String(newFunction.functionName).trim())
      return alert("Function name required");
    if (!newFunction.functionDateTime) return alert("Function date required");
    if (newFunction.assingTo === "Other" && !newFunction.assignToHandle.trim())
      return alert("Assigned to name required");

    const functionDateTime = new Date(newFunction.functionDateTime).getTime();

    try {
      if (editingFunction) {
        // Update
        await axios.put(
          `${config.BASE_URL}order/assignment/${eventData.id}/function/${editingFunction.id}`,
          { ...newFunction, functionDateTime },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFunctions((prev) =>
          prev.map((func) =>
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
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const apiData = response.data;

        const newFunc = {
          id: apiData?.id || Date.now(),
          functionName: apiData?.functionName || newFunction.functionName,
          functionDateTime: apiData?.functionDateTime || functionDateTime,
          assingTo: apiData?.assingTo || newFunction.assingTo,
          assignToHandle: apiData?.assignToHandle || newFunction.assignToHandle,
        };

        setFunctions((prev) => [...prev, newFunc]);
        alert("Function added");
      }

      setNewFunction({
        functionName: "",
        functionDateTime: "",
        assingTo: "Me",
        assignToHandle: "MeTo",
      });
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
      functionDateTime: new Date(func.functionDateTime)
        .toISOString()
        .split("T")[0],
      assingTo: func.assingTo || "Me",
      assignToHandle: func.assignToHandle || "",
    });

    setEditingFunction(func);
  };

  // ------------- Add / Update Transaction -------------
  const handleAddOrUpdateTransaction = async () => {
    if (!newTransaction.receivedPayment)
      return alert("Payment amount required");

    if (Number(newTransaction.receivedPayment) <= 0)
      return alert("Payment amount must be positive");

    if (!newTransaction.receivedDate) return alert("Received date required");

    if (
      !newTransaction.paymentNote ||
      !String(newTransaction.paymentNote).trim()
    ) {
      return alert("Payment note is required");
    }

    const receivedDate = new Date(newTransaction.receivedDate).getTime();

    try {
      if (editingTransaction) {
        await axios.put(
          `${config.BASE_URL}order/assignment/${eventData.id}/transaction/${editingTransaction.id}`,
          { ...newTransaction, receivedDate },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === editingTransaction.id
              ? { ...txn, ...newTransaction, receivedDate }
              : txn
          )
        );

        alert("Transaction updated");
      } else {
        const response = await axios.post(
          `${config.BASE_URL}order/assignment/${eventData.id}/transaction`,
          { ...newTransaction, receivedDate },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const apiData = response.data;

        const newTxn = {
          id: apiData?.id || Date.now(),
          receivedPayment:
            apiData?.receivedPayment || newTransaction.receivedPayment,
          receivedDate: apiData?.receivedDate || receivedDate,
          paymentNote: apiData?.paymentNote || newTransaction.paymentNote,
        };

        setTransactions((prev) => [...prev, newTxn]);
        alert("Transaction added");
      }

      setNewTransaction({
        receivedPayment: "",
        receivedDate: "",
        paymentNote: "",
      });
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
      paymentNote: safe(txn.paymentNote),
    });

    setEditingTransaction(txn);
  };

  // ------------- Totals -------------
  const totalPaid = transactions.reduce(
    (sum, t) => sum + Number(t.receivedPayment || 0),
    0
  );
  const remaining = (formData.totalAmount || 0) - totalPaid;

  // overall validity for disabling the Update button
  const formIsValid = () => {
    // quick check: no error messages and required fields present
    const required = [
      "customerName",
      "customerMobile",
      "customerEmail",
      "customerAddress",
      "assignmentAddress",
      "contactPerson1Mobile",
      "assignmentDate",
      "assignmentTime",
      "assignmentNote",
      "totalAmount",
    ];

    for (const f of required) {
      if (!formData[f] && formData[f] !== 0) return false;
      if (errors[f]) return false;
    }

    // assignmentName handled separately
    if (showOtherInput) {
      if (!customAssignmentName || !String(customAssignmentName).trim())
        return false;
      if (errors.customAssignmentName) return false;
    } else {
      if (!formData.assignmentName || !String(formData.assignmentName).trim())
        return false;
      if (errors.assignmentName) return false;
    }

    // email pattern
    if (!emailRegex.test(String(formData.customerEmail || "").trim()))
      return false;

    // total amount numeric > 0
    if (
      isNaN(Number(formData.totalAmount)) ||
      Number(formData.totalAmount) <= 0
    )
      return false;

    return true;
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      backdrop="static"
      keyboard={false}
    >
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
                  isInvalid={!!errors.customerName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  name="customerMobile"
                  value={safe(formData.customerMobile)}
                  onChange={handleChange}
                  isInvalid={!!errors.customerMobile}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerMobile}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="customerEmail"
                  value={safe(formData.customerEmail)}
                  onChange={handleChange}
                  isInvalid={!!errors.customerEmail}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerEmail}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="customerAddress"
                  value={safe(formData.customerAddress)}
                  onChange={handleChange}
                  isInvalid={!!errors.customerAddress}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.customerAddress}
                </Form.Control.Feedback>
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
                  isInvalid={
                    !!errors.assignmentName || !!errors.customAssignmentName
                  }
                  required={!showOtherInput}
                >
                  <option value="">-- Select Assignment --</option>
                  {uniqueAssignmentNames.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.assignmentName || errors.customAssignmentName}
                </Form.Control.Feedback>
              </Form.Group>

              {showOtherInput && (
                <Form.Group className="mb-3">
                  <Form.Label>New Assignment Name</Form.Label>
                  <Form.Control
                    value={customAssignmentName}
                    onChange={(e) => {
                      setCustomAssignmentName(e.target.value);
                      if (!e.target.value || !String(e.target.value).trim()) {
                        setErrors((prev) => ({
                          ...prev,
                          customAssignmentName: "Assignment name required",
                        }));
                      } else {
                        setErrors((prev) => ({
                          ...prev,
                          customAssignmentName: "",
                        }));
                      }
                    }}
                    isInvalid={!!errors.customAssignmentName}
                    required={showOtherInput}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customAssignmentName}
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  name="assignmentAddress"
                  value={safe(formData.assignmentAddress)}
                  onChange={handleChange}
                  isInvalid={!!errors.assignmentAddress}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.assignmentAddress}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Alternate Contact</Form.Label>
                <Form.Control
                  name="contactPerson1Mobile"
                  value={safe(formData.contactPerson1Mobile)}
                  onChange={handleChange}
                  isInvalid={!!errors.contactPerson1Mobile}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPerson1Mobile}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="assignmentDate"
                  value={safe(formData.assignmentDate)}
                  onChange={handleChange}
                  isInvalid={!!errors.assignmentDate}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.assignmentDate}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="assignmentTime"
                  value={safe(formData.assignmentTime)}
                  onChange={handleChange}
                  isInvalid={!!errors.assignmentTime}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.assignmentTime}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="assignmentNote"
                  value={safe(formData.assignmentNote)}
                  onChange={handleChange}
                  isInvalid={!!errors.assignmentNote}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.assignmentNote}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control
                  name="totalAmount"
                  type="number"
                  value={safe(formData.totalAmount, 0)}
                  onChange={handleChange}
                  isInvalid={!!errors.totalAmount}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.totalAmount}
                </Form.Control.Feedback>
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
                  setFormData((prev) => ({
                    ...prev,
                    assignToName: "Me",
                    assignToHandle: "MeTo",
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
                  setFormData((prev) => ({
                    ...prev,
                    assignToName: "Other",
                    assignToHandle: safe(prev.assignToHandle, ""),
                  }))
                }
              />

              {formData.assignToName === "Other" && (
                <Form.Group className="mt-2">
                  <Form.Label>Other Name</Form.Label>
                  <Form.Control
                    value={safe(formData.assignToHandle)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        assignToHandle: value,
                      }));
                      validateField("assignToHandle", value); // 🔴 live validation
                    }}
                    isInvalid={!!errors.assignToHandle}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.assignToHandle}
                  </Form.Control.Feedback>
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
                    <td>
                      {new Date(func.functionDateTime).toLocaleDateString()}
                    </td>
                    <td>{func.assingTo}</td>
                    <td>{func.assignToHandle || "—"}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEditFunction(func)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteFunction(func.id)}
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
                <Form.Label>Function Name</Form.Label>
                <Form.Control
                  value={safe(newFunction.functionName)}
                  onChange={(e) =>
                    setNewFunction((prev) => ({
                      ...prev,
                      functionName: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={safe(newFunction.functionDateTime)}
                  onChange={(e) =>
                    setNewFunction((prev) => ({
                      ...prev,
                      functionDateTime: e.target.value,
                    }))
                  }
                  required
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
                    setNewFunction((prev) => ({
                      ...prev,
                      assingTo: "Me",
                      assignToHandle: "MeTo",
                    }))
                  }
                />

                <Form.Check
                  type="radio"
                  label="Other"
                  name="assingTo"
                  checked={newFunction.assingTo === "Other"}
                  onChange={() =>
                    setNewFunction((prev) => ({
                      ...prev,
                      assingTo: "Other",
                      assignToHandle: "",
                    }))
                  }
                />

                {newFunction.assingTo === "Other" && (
                  <Form.Control
                    className="mt-2"
                    placeholder="Enter name"
                    value={safe(newFunction.assignToHandle)}
                    onChange={(e) =>
                      setNewFunction((prev) => ({
                        ...prev,
                        assignToHandle: e.target.value,
                      }))
                    }
                    required
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
                    <td>
                      {txn.receivedDate
                        ? new Date(txn.receivedDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{txn.paymentNote}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleEditTransaction(txn)}
                      >
                        Edit
                      </Button>{" "}
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
                    setNewTransaction((prev) => ({
                      ...prev,
                      receivedPayment: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Received Date</Form.Label>
                <Form.Control
                  type="date"
                  value={safe(newTransaction.receivedDate)}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      receivedDate: e.target.value,
                    }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Note</Form.Label>
                <Form.Control
                  value={safe(newTransaction.paymentNote)}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      paymentNote: e.target.value,
                    }))
                  }
                  required
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

        <Button
          variant="primary"
          onClick={handleUpdateAssignment}
          disabled={!formIsValid()}
        >
          Update Assignment
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
