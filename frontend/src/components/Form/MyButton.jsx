import '../../App.css'
import Button from '@mui/material/Button';
export const MyButton = (props)=>{
    const {label} = props
    return(
        <Button variant="contained" className='myButton'>
            {label}
        </Button>
    )
}
