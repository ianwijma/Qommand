import {useWindowControls} from "../../hooks/useWindowControls";
import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowMinimize, faXmark} from "@fortawesome/free-solid-svg-icons";

type TitleBarButtonProps = PropsWithChildren & {
    onClick?: () => void;
}

const TitleBarButton = ({children, onClick}: TitleBarButtonProps) => {
    return <button
        onClick={onClick}
        className='no-drag bg-red-500 w-6 h-6 rounded-full flex justify-center items-center'>
        {children}
    </button>
}

type TitleBarProps = PropsWithChildren & {
    showMinimize?: boolean;
    showClose?: boolean;
}

export const TitleBar = ({children, showMinimize = true, showClose = true}: TitleBarProps) => {
    const {minimize, close} = useWindowControls();

    return <div id='title-bar' className='flex justify-between bg-slate-800 px-1 py-1'>
        <span className='max-w-[1000px] overflow-ellipsis overflow-hidden'>{children}</span>
        <div className='flex gap-2'>
            {
                showMinimize && (
                    <TitleBarButton onClick={minimize}>
                        <FontAwesomeIcon icon={faWindowMinimize} size='xs'/>
                    </TitleBarButton>
                )
            }
            {
                showClose && (
                    <TitleBarButton onClick={close}>
                        <FontAwesomeIcon icon={faXmark} size='sm'/>
                    </TitleBarButton>
                )
            }
        </div>
    </div>
}