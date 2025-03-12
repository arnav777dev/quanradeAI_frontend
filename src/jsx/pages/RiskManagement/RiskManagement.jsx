import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Accordion, AccordionDetails, AccordionSummary, Typography,Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import swal from 'sweetalert';

export default function RiskManagement() {
  const hasFetchedRef = useRef(false);
  const [riskManagement, setRiskManagementData] = useState([]);

  // Example token
  const token = localStorage.getItem("userDetails") || ''; // Provide a fallback to an empty string
  const accessToken = token ? JSON.parse(token).access : "";;

const headers = {
    Authorization: "Bearer "+accessToken,
  };
  const headerElement = document.getElementById("headerTextUpdate");
  if (headerElement) {
    headerElement.innerHTML = "Fund Management";
  }
  useEffect(() => {
    if (!hasFetchedRef.current) {
      const source = axios.CancelToken.source();
      hasFetchedRef.current = true;

      const fetchRiskManagementData = async () => {
        try {
          const response = await axios.get('https://api.quantradeai.com/main/capital/details/', {
            headers,
          });
          setRiskManagementData(response.data.data);
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };

      fetchRiskManagementData();
      return () => {
        source.cancel('Operation canceled by the user.');
      };
    }
  }, []);

  const handleInputChange = (name, value) => {
    setRiskManagementData((prevData) => {
      const updatedData = [...prevData];
      if (updatedData.length > 0) {
        updatedData[0][name] = value;
      }
      return updatedData;
    });
  };

  const handleUpdate = async () => {
    const riskManagementData = riskManagement[0];
    const parsedRiskManagement = {
      total_capital: parseFloat(riskManagementData?.total_capital || '0'),
      funds_added_this_month: parseFloat(riskManagementData?.funds_added_this_month || '0'),
      total_investment_value: parseFloat(riskManagementData?.total_investment_value || '0'),
      total_portfolio_current_value: parseFloat(riskManagementData?.total_portfolio_current_value || '0'),
      fixed_on_total_capital_dcc: parseFloat(riskManagementData?.fixed_on_total_capital_dcc || '0'),
      fixed_on_total_capital_wcc: parseFloat(riskManagementData?.fixed_on_total_capital_wcc || '0'),
      fixed_on_total_capital_mcc: parseFloat(riskManagementData?.fixed_on_total_capital_mcc || '0'),
      fixed_risk_per_stock: parseFloat(riskManagementData?.fixed_risk_per_stock || '0'),
      risk_per_stock: parseFloat(riskManagementData?.risk_per_stock || '0'),
      risk_of_total_portfolio: parseFloat(riskManagementData?.risk_of_total_portfolio || '0'),
      num_of_risks: parseFloat(riskManagementData?.num_of_risks || '0'),
      future_index_buying: parseFloat(riskManagementData?.future_index_buying || '0'),
      future_index_selling: parseFloat(riskManagementData?.future_index_selling || '0'),
      options_index_buying: parseFloat(riskManagementData?.options_index_buying || '0'),
      options_index_selling: parseFloat(riskManagementData?.options_index_selling || '0'),
      futures_stocks_buying: parseFloat(riskManagementData?.futures_stocks_buying || '0'),
      futures_stocks_selling: parseFloat(riskManagementData?.futures_stocks_selling || '0'),
      options_stocks_buying: parseFloat(riskManagementData?.options_stocks_buying || '0'),
      options_stocks_selling: parseFloat(riskManagementData?.options_stocks_selling || '0'),
      futures_commodities: parseFloat(riskManagementData?.futures_commodities || '0'),
    };

    try {
      const response = await axios.post(
        `https://api.quantradeai.com/main/capital/details/`,
        parsedRiskManagement,
        { headers }
      );
      if (response.status === 200) {
        console.log('Data Updated successfully:', response.data);
        swal("Updated!", "Data Updated successfully!", "success");
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error updating data:', error);
      swal("Failed!", "Failed to delete orders!", "error");
    }
  };

  const riskManagementData = riskManagement[0] || {};

  return (
<Box
  component="form"
  sx={{
    '& .MuiTextField-root': { m: 1, width: '100%' }, // Flexible width
  }}
  autoComplete="off"
>
  {/* Funds Section */}
  <Box mb={2}>
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content">
        <Typography>Funds</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Total Capital"
              type="number"
              value={riskManagementData?.total_capital}
              onChange={(e) => handleInputChange('total_capital', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Funds Added This Month"
              type="number"
              value={riskManagementData?.funds_added_this_month}
              onChange={(e) => handleInputChange('funds_added_this_month', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Total Investment Value"
              type="number"
              value={riskManagementData?.total_investment_value}
              onChange={(e) => handleInputChange('total_investment_value', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Total Portfolio Current Value"
              type="number"
              value={riskManagementData?.total_portfolio_current_value}
              onChange={(e) => handleInputChange('total_portfolio_current_value', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>

  {/* Fixed Risk on Total Capital Section */}
  <Box mb={2}>
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content">
        <Typography>Fixed Risk on Total Capital</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Fixed on Total Capital DCC"
              type="number"
              value={riskManagementData?.fixed_on_total_capital_dcc}
              onChange={(e) => handleInputChange('fixed_on_total_capital_dcc', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Fixed on Total Capital WCC"
              type="number"
              value={riskManagementData?.fixed_on_total_capital_wcc}
              onChange={(e) => handleInputChange('fixed_on_total_capital_wcc', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Fixed on Total Capital MCC"
              type="number"
              value={riskManagementData?.fixed_on_total_capital_mcc}
              onChange={(e) => handleInputChange('fixed_on_total_capital_mcc', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>

  {/* Risk on Equity Section */}
  <Box mb={2}>
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content">
        <Typography>Risk on Equity</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Fixed Risk Per Stock"
              type="number"
              value={riskManagementData?.fixed_risk_per_stock}
              onChange={(e) => handleInputChange('fixed_risk_per_stock', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Risk Per Stock"
              type="number"
              value={riskManagementData?.risk_per_stock}
              onChange={(e) => handleInputChange('risk_per_stock', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Risk of Total Portfolio"
              type="number"
              value={riskManagementData?.risk_of_total_portfolio}
              onChange={(e) => handleInputChange('risk_of_total_portfolio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              required
              label="Number of Risks"
              type="number"
              value={riskManagementData?.num_of_risks}
              onChange={(e) => handleInputChange('num_of_risks', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  </Box>

  {/* Risk on F&O Section */}
  <Box mb={2}>
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4-content">
      <Typography>Risk on F&O</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {/* Future Index Buying */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Future Index Buying"
            type="number"
            value={riskManagementData?.future_index_buying}
            onChange={(e) => handleInputChange('future_index_buying', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Future Index Selling */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Future Index Selling"
            type="number"
            value={riskManagementData?.future_index_selling}
            onChange={(e) => handleInputChange('future_index_selling', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Options Index Buying */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Options Index Buying"
            type="number"
            value={riskManagementData?.options_index_buying}
            onChange={(e) => handleInputChange('options_index_buying', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Options Index Selling */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Options Index Selling"
            type="number"
            value={riskManagementData?.options_index_selling}
            onChange={(e) => handleInputChange('options_index_selling', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Futures Stocks Buying */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Futures Stocks Buying"
            type="number"
            value={riskManagementData?.futures_stocks_buying}
            onChange={(e) => handleInputChange('futures_stocks_buying', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Futures Stocks Selling */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Futures Stocks Selling"
            type="number"
            value={riskManagementData?.futures_stocks_selling}
            onChange={(e) => handleInputChange('futures_stocks_selling', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Options Stocks Buying */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Options Stocks Buying"
            type="number"
            value={riskManagementData?.options_stocks_buying}
            onChange={(e) => handleInputChange('options_stocks_buying', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Options Stocks Selling */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Options Stocks Selling"
            type="number"
            value={riskManagementData?.options_stocks_selling}
            onChange={(e) => handleInputChange('options_stocks_selling', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Futures Commodities */}
        <Box sx={{ flex: 2, minWidth: 'calc(20% - 16px)' }}>
          <TextField
            required
            label="Futures Commodities"
            type="number"
            value={riskManagementData?.futures_commodities}
            onChange={(e) => handleInputChange('futures_commodities', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Box>
    </AccordionDetails>
  </Accordion>
</Box>
  {/* Update Button */}
  <Box textAlign="Right" mt={2}>
    <Button variant="contained"  onClick={handleUpdate}>Update</Button>
  </Box>
</Box>

  )
}
