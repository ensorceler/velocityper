import Lottie from "lottie-react";
import walkingBird from "../../../../public/lottie/bird-walking.json";

const users = [
  {
    name: "Olivia Martin",
    email: "m@example.com",
    avatar: "/avatars/01.png",
    loop: false,
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "/avatars/03.png",
    loop: true,
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar: "/avatars/05.png",
    loop: true,
  },
] as const;

const RaceParticipants = () => {
  return (
    <div className="flex flex-col gap-14">
      {users.map((user) => (
        <div
          key={user.name}
          className="w-full h-0 border-0 border-t-2 border-dashed border-t-neutral-400 relative"
        >
          <div className="absolute -bottom-8 ">
            <p className="absolute bottom-[36px] text-sm">
              {user.name.slice(0, 5).trim().toString() + "..."}
            </p>
            <Lottie
              //className=""
              style={{ height: 120, width: 120 }}
              animationData={walkingBird}
              loop={user.loop}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RaceParticipants;
