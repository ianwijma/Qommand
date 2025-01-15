'use client';

import {DefaultWindowContainer} from "../../../components/windowContainer/DefaultWindowContainer";
import {PageContent} from "./PageContent";


export default function DialogMessagePage() {
    return <DefaultWindowContainer title='Create task' showMinimize={false} showClose={false}>
        <PageContent/>
    </DefaultWindowContainer>
}