import TextField from '@mui/material/TextField'
import '../../App.css'
import { Controller } from 'react-hook-form'
export default function MyTextField(props) {
  const { label, name, control } = props
  return (

    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState,
      }) => (
        <TextField
          id="outlined-basic"
          onChange={onChange}
          value={value}
          error={!!error}
          helperText={error?.message}
          label={label}
          variant="outlined"
          className='myForm'
        />
      )}
    />


  );
}
