import React from 'react';
import {Outlet,Link} from 'react-router-dom';

export function Navbar(){

        return(
            // this is the navbar that is displayed on every page
            //these are bootstrap classes look em up
            <>
                <nav >
                   
                    <Link to="/home">Onboarding Hero</Link>
                </nav>

                <Outlet />
            </>
        );
}