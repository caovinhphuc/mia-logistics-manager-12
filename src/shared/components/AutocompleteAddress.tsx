import React, { useState } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';

interface AutocompleteAddressProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const AutocompleteAddress: React.FC<AutocompleteAddressProps> = ({
  value = '',
  onChange,
  label = 'Địa chỉ',
  placeholder = 'Nhập địa chỉ',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);

  return (
    <Autocomplete
      freeSolo
      value={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        onChange?.(newInputValue);
      }}
      options={[]}
      disabled={disabled}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} />
      )}
    />
  );
};

export default AutocompleteAddress;
