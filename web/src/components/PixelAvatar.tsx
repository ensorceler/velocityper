import {minidenticon} from 'minidenticons'
import {ImgHTMLAttributes, useMemo} from 'react'
import {JSX} from "react/jsx-runtime";


interface Props extends ImgHTMLAttributes<any> {
    username: string;
    saturation?: string;
    lightness?: string;
}

const PixelAvatar = ({username, saturation, lightness, ...props}: Props) => {
    const svgURI = useMemo(
        () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, saturation, lightness)),
        [username, saturation, lightness]
    )
    return (<img src={svgURI} alt={username} {...props} />)
}

export default PixelAvatar;