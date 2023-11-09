import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import OpenAI from 'openai'

import { Button } from '@mui/material'
import TextField from '@mui/material/TextField'

const inputStyles = {
  textfieldStyles: {
    width: '70%',
    height: '66px',
    fontFamily: 'Open Sans',
    '& .MuiInputBase-formControl': { height: '100%', width: '100%' },
    '& .MuiFormLabel-root.Mui-focused': { color: 'rgba(244, 67, 54, 1)', fontFamily: 'Inter', fontWeight: '400' },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.25)', transition: 'ease 0.075s' },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(75, 181, 67, 1)', transition: 'ease 0.075s' },
    '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(255,255,255,1) !important', transition: 'ease 0.075s', filter:'drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.77))'},
    '&:hover .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(75, 181, 67, 1) !important', transition: 'ease 0.075s', filter:'drop-shadow(0px 0px 2px rgba(75, 181, 67, 0.77))'},
    '& .MuiInputBase-input': { height: '100%', color: 'white', fontFamily: 'Open Sans', fontSize: '16px', textShadow: '0px 0px 1px black', background: 'rgba(47,47,47,0)', borderRadius: '5px' }
  },
  buttonStyle: {
    width: '25%',
    height: '66px',
    transition: '0.125s ease',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: 'white',
    fontSize: '0.8rem',
    '&:hover': {width: '25%', border: '1px solid rgba(75, 181, 67, 0.5)', backgroundColor: 'rgba(75, 181, 67, 0.05)', color: 'rgba(75, 181, 67, 1)', filter:'drop-shadow(0px 0px 1px rgba(75, 181, 67, 0.77))'},
  }
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function App() {
  const [inputValue, setInputValue] = useState(null)
  const [paletteValues, setPaletteValues] = useState([''])
  const [hover, setHover] = useState(false)
  const [flash, setFlash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlash(false);
    }, 6000); // Remove the flash after 5 seconds

    return () => clearTimeout(timer); // Clear the timeout if the component unmounts
  }, []);

  const handleChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleClick = async() => {
    console.log('Sent out request!');

    let messages = [
      {role: 'system', content: 'You are a color palette generation assistant. You respond to text prompts and convert them into color palettes. You output the color palettes in the form'
        + ' of a JSON array with hexadecimal color codes. You do not need to provide any other information other than the JSON array and color codes. Do not add any comments to the JSON array.'
        + ' As an example, Please output the JSON array in the format: ["#006699", "#66CCCC", "#F0E68C", "#0080000", "#F08080"]. Another example would be ["#EDF1D6", "#9DC08B", "#609966", "#40513B"].'
        + ' The palettes should be between 2 and 8 colors.'
      },
      {role: 'user', content: inputValue}
    ]

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: messages,
        max_tokens: 200,
        response_format: { type: 'text' }
      });

      const outputObj = JSON.parse(response.choices[0].message.content)
      setPaletteValues(outputObj)
    } catch (error) {
      console.error('Error making OpenAI request:', error);
    }
  } 

  const handleColorClick = async(color) => {
    try {
      await navigator.clipboard.writeText(color)
      console.log(`Copied ${color} color to clipboard!`)
    } catch(err) {
      console.error("Failed to copy color to clipboard: ", err)
    }
  }

  const colorStyle = (color, length) => ({
    display: 'flex',
    height: '100%',
    width: `calc(100% / ${length})`,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: color,
  });

  const styles = {
    pageContainer: {
      display: 'flex',
      width: '100%',
      height: '100%',
    },
    formContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      paddingLeft: '25px',
      paddingRight: '25px',
      width: '25%',
      height: '15%',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.88)',
      borderRadius: '10px',
      opacity: hover ? 1 : 0,
      transition: 'opacity 0.1s ease'
    },
    spanStyle: {
      display: 'flex',
      width: '50%',
      height: '5%',
      marginBottom: '1em',
      color: 'white',
      fontSize: '3em',
      textShadow: '0px 0px 3px black',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }

  return (
    <>
      <div style={styles['pageContainer']}>
        {paletteValues.length > 1 && paletteValues.map((color, index) => (
          <div key={color} style={colorStyle(color, paletteValues.length)}>
            <span key={index} style={styles['spanStyle']} role='button' onClick={() => handleColorClick(color)}>{color}</span>
          </div>
        ))}
        <div className={flash ? 'flash-animation' : ''} style={styles['formContainer']} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <TextField sx={inputStyles['textfieldStyles']} onChange={(e) => handleChange(e)} placeholder='Imagine a color palette...'/>
          <Button variant='outlined' sx={inputStyles['buttonStyle']} onClick={() => handleClick()}>Generate Palette</Button>
        </div>    
      </div>
    </>
  )
}

export default App
