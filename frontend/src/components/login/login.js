import React  from "react";
import './login.css';
import {Link} from `react-router-dom`;

const STYLES = ['btn--primary'];

const SIZES = ['btn--medium'];

// export const Button = ({
//     children,
//     type,
//     onClick,
//     buttonStyle,
//     buttonSize
// }) => {
//     const checkButtonStyle = STYLES.includes(buttonStyle)
//     ? buttonStyle
//     : STYLES[0];

//     const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0]

//     return(
//         <Link to= '/log-in' className='btn-mobile'>
//             <button
//             className={`btn `}
//             >
//                 {children}

//             </button>
//         </Link>
//     )
// }

const Button = () => {
    return(
        <button>One</button>
    );
};

export default login;



