import '../../App.css'
import Button from '@mui/material/Button';
export const MyButton = (props)=>{
    const {label,type} = props
    return(
        <Button type={type} variant="contained" className='myButton'>
            {label}
        </Button>
    )
}
