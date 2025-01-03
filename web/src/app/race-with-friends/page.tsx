import RaceWithFriends from "@/components/modules/type-race/RaceWithFriends";
import {Suspense} from "react";

export default function RaceWithFriendsPage() {
    return (
        <main>
            <Suspense >
                <RaceWithFriends/>
            </Suspense>
        </main>
    );
}
