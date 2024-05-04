import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { TextField, Button, Container, Typography, Grid, Paper, Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#124E66',
        },
        secondary: {
            main: '#748D92',
        },
        error: {
            main: '#E53935',
        },
        background: {
            default: '#E2E2E2',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#212A31',
            secondary: '#2E3944',
        }
    },
});

function InvoiceEntry() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        orderId: '',
        customerId: '',
        paymentMethod: '',
        subtotal: 0,
        tax: 0,
        total: 0,
        paymentStatus: 'Pending',
    });
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState('');

    useEffect(() => {
        if (location.state && location.state.invoice) {
            const { invoice} = location.state;
            setFormData({ ...formData, ...invoice });
        }
    }, [location]);

    useEffect(() => {
        if (location.state && location.state.orderId) {
            const { orderId} = location.state;
            setFormData({ ...formData, orderId});
        }
    }, [location]);

    const fetchOrderDetails = useCallback(async (orderId) => {
        try {
            const { data } = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
            if (data) {
                setFormData(prevState => ({
                    ...prevState,
                    customerId: data.customerId,
                    subtotal: data.amount,
                    paymentMethod: data.paymentMethod,
                    // Assuming tax is not part of the fetched data and needs to be calculated or added manually
                    total: (parseFloat(data.amount) + parseFloat(prevState.tax)).toFixed(2),
                }));
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            setAlert('Failed to fetch order details. Please check the Order ID.');
            setOpen(true);
        }
    }, []);

    useEffect(() => {
        if (formData.orderId) {
            const timer = setTimeout(() => fetchOrderDetails(formData.orderId), 500);
            return () => clearTimeout(timer);
        }
    }, [formData.orderId, fetchOrderDetails]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const updatedData = { ...prev, [name]: value };

            if (name === 'tax') {
                updatedData.total = (parseFloat(updatedData.subtotal) + parseFloat(value)).toFixed(2);
            }

            return updatedData;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/invoices', formData);
            console.log('Invoice saved:', response.data);
            navigate('/invoice-details');
        } catch (error) {
            console.error('Failed to save invoice:', error);
            setAlert('Failed to save invoice. Please try again.');
            setOpen(true);
        }
    };

    const handleClose = () => setOpen(false);

    return (
        <ThemeProvider theme={theme}>
            <Container component={Paper} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h6">Invoice Entry</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Order ID"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Customer ID"
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subtotal"
                                name="subtotal"
                                value={formData.subtotal}
                                onChange={handleChange}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Tax"
                                name="tax"
                                type="number"
                                value={formData.tax}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Total"
                                name="total"
                                value={formData.total}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Payment Status"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Button type="submit" color="primary" variant="contained" style={{ marginTop: '20px' }}>Generate Invoice</Button>
                </form>
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                        {alert}
                    </Alert>
                </Snackbar>
            </Container>
        </ThemeProvider>
    );
}

export default InvoiceEntry;
