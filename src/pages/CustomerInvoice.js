import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';
import FileDownload from 'js-file-download';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#124E66', // Dark teal for important elements
        },
        secondary: {
            main: '#748D92', // Medium gray-blue for secondary elements
        },
        error: {
            main: '#E53935', // Red for error messages
        },
        background: {
            default: '#E2E2E2', // Light gray for the general background
            paper: '#FFFFFF', // White for paper components
        },
        text: {
            primary: '#212A31', // Dark blue for main text
            secondary: '#2E3944', // Lighter blue for secondary text
        }
    },
});

function CustomerInvoice() {
    const [invoices, setInvoices] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'Customer') {
            fetchInvoicesByCustomerId(user.id);
        }
    }, [user]);

    const fetchInvoicesByCustomerId = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/invoices/customer/${customerId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setInvoices(response.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/invoices/download/${user.id}`, {
                responseType: 'blob', // Important for handling binary data
                headers: { Authorization: `Bearer ${user.token}` }
            });
            FileDownload(response.data, 'invoices.xlsx');
        } catch (error) {
            console.error('Error downloading invoices:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Paper style={{ margin: '20px', padding: '20px', backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h6" style={{ color: theme.palette.text.primary, margin: '10px 0' }}>Your Invoices</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Invoice ID</TableCell>
                            <TableCell>Subtotal</TableCell>
                            <TableCell>Tax</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                                <TableCell>{invoice.invoiceId}</TableCell>
                                <TableCell>{invoice.subtotal.toFixed(2)}</TableCell>
                                <TableCell>{invoice.tax.toFixed(2)}</TableCell>
                                <TableCell>{invoice.total.toFixed(2)}</TableCell>
                                <TableCell>{invoice.paymentStatus}</TableCell>
                                <TableCell>
                                    <Button onClick={handleDownload} variant="contained" color="primary">
                                        Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={handleDownload} variant="contained" color="primary" style={{ marginTop: '20px' }}>
                    Download Excel
                </Button>
            </Paper>
        </ThemeProvider>
    );
}

export default CustomerInvoice;
