'use client';

import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {version} from 'qommand/package.json'


export default function AboutPage() {

    return <DefaultWindowContainer title='About Qommand'>
        <div className='w-full h-screen flex justify-center items-center'>
            Version: {version}
        </div>
    </DefaultWindowContainer>
}