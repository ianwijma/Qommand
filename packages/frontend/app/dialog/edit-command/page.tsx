'use client';

import {DefaultWindowContainer} from "../../../components/windowContainer/DefaultWindowContainer";
import {PageContent} from "./PageContent";
import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export default function DialogMessagePage() {
    const {emitButtonClick} = useButtonClick();
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    return <DefaultWindowContainer title={title} showMinimize={false} onCloseClicked={() => emitButtonClick('cancel')}>
        <PageContent/>
    </DefaultWindowContainer>
}