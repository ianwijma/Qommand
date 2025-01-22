'use client';

import {DefaultWindowContainer} from "../../../components/windowContainer/DefaultWindowContainer";
import {PageContent} from "./PageContent";
import {useSearchParams} from "next/navigation";

export default function DialogMessagePage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    return <DefaultWindowContainer title={title} showMinimize={false} showClose={false}>
        <PageContent/>
    </DefaultWindowContainer>
}