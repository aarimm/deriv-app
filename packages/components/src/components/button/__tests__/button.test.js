import React      from 'react';
import { render } from '@testing-library/react';
import Button     from  '../button.jsx';

describe('Button' , () => {

    it('renders without crashing' , () => {
        render(<Button/>)
    })

    it('should contains name', () =>{
        const { getByText } = render(<Button name='button'/>);
        getByText('button');
    })
})