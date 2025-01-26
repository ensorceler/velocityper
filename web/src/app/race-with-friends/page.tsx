'use server';

import dynamic from "next/dynamic";


// use dynamic import
const RaceWithFriends = dynamic(() => import("@/components/modules/type-race/RaceWithFriends"), {ssr: false});

export default async function RaceWithFriendsPage() {
    return (
        <main>
            <RaceWithFriends/>
        </main>
    );
}
