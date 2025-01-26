import walkingBird from "../../../../public/lottie/bird-walking.json";
import {useTypeRaceState} from "@/global-state/typeRaceState";
import {useEffect, useRef, useState} from "react";
import {Player} from '@lottiefiles/react-lottie-player';
import getNumberWithOrdinal from "@/utils/getNumberWithOrdinal";
import {Badge} from "@/components/ui/badge";


const RaceParticipants = () => {
    const {roomJoinedUsers, raceData, userInfo, roomInfo} = useTypeRaceState();
    const lottieUserRef = useRef(null);
    //const [participants, setParticipants] = useState();
    const [participants, setParticipants] = useState(roomJoinedUsers);
    //const [participants, setParticipants] = useState([]);

    useEffect(() => {
        if (roomInfo && raceData) {
            console.log('RaceParticipants: roomInfo =>', roomInfo);
            console.log('RaceParticipants: raceData =>', raceData);
            setParticipants(raceData as any);
        } else if (raceData === null) {
            setParticipants(roomJoinedUsers as any);
        }
    }, [raceData, roomInfo, roomJoinedUsers]);


    return (
        <RaceTrackDemo participants={participants}/>
    )
};


export default RaceParticipants;

const RaceTrackDemo = ({participants}: any) => {
    const trackRefs = useRef(new Map());
    //const [participants, setParticipants] = useState([]);
    const containerRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        participants?.forEach((user: any) => {
            console.log('participants for each: ', user);
            if (user.joined_race && trackRefs.current.has(user.id)) {
                const player = trackRefs.current.get(user.id);
                if (player) {
                    console.log("player ###=>", player)
                    // Calculate position based on progress percentage (0-100)
                    const progress = user?.race_data?.traversal_percentage || 0; // Assuming you have a progress value
                    //const containerWidth = player.container?.offsetWidth || 0;
                    const containerWidth = containerRef?.current?.offsetWidth || 0;
                    const maxTranslate = containerWidth - 40; // Subtract animation width
                    const translateX = (progress / 100) * maxTranslate;
                    console.log('progress =>', progress);
                    console.log('container Width =>', containerWidth);
                    console.log('max Translate =>', maxTranslate);
                    console.log('translateX = =>', translateX);
                    // Apply transform to the player container
                    if (player.container) {
                        console.log("player container =>", player.container)
                        player.container.style.transform = `translateX(${translateX}px)`;
                        player.container.style.transition = 'transform 0.5s ease-in-out';
                    }
                }
            }
        });
        console.log('participants =>', participants);
    }, [participants]);

    return (
        <div className="flex flex-col gap-16">
            {participants?.map((user: any) => (
                user.joined_race && (
                    <div
                        key={user.id}
                        className="w-[90%] h-0 border-0 border-t-2 border-dashed border-t-neutral-400 relative"
                        ref={containerRef}
                    >
                        <div className="absolute left-0 -bottom-8 transition-transform duration-500">
                            <p className="absolute bottom-[36px] text-sm">
                                {user.user_name?.slice(0, 7).trim().toString() + "..."}
                            </p>
                            <Player
                                ref={ref => {
                                    if (ref) {
                                        trackRefs.current.set(user.id, ref);
                                    }
                                }}
                                className="h-[120px] w-[120px]"
                                src={walkingBird}
                                loop={true}
                                autoplay={true}
                                speed={1.5}
                            />
                        </div>
                        <div className="absolute -right-[100px] -bottom-0  flex flex-col gap-[2px]">
                            {
                                !!user?.race_ranking &&
                                <Badge variant="outline">
                                    <p className="text-sm">{getNumberWithOrdinal(user?.race_ranking)} Rank</p>
                                </Badge>
                            }
                            {user?.race_data?.wpm &&
                                <p className="text-base"><span>{user?.race_data?.wpm}</span><span>WPM</span></p>}
                        </div>
                    </div>
                )
            ))}
        </div>
    );


}


/*

const demodata = [
    {
        "user_name": "stroheim",
        "id": "d79a51fb-92ce-4568-8844-9af29629e59b",
        "is_creator": false,
        "joined_race": true,
        "race_data": {
            "gross_wpm": 2,
            "wpm": 2,
            "accuracy": 100,
            "traversal_percentage": 31
        }
    },
    {
        "user_name": "JoJo",
        "id": "4ca07f4d-494a-49e4-b85f-513e5c68802d",
        "is_creator": true,
        "joined_race": true,
        "race_data": {
            "gross_wpm": 5.33,
            "wpm": 5.33,
            "accuracy": 100,
            "traversal_percentage": 62
        }
    }
];
*/