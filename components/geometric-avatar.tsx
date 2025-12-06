import Avatar from "boring-avatars";
import { ComponentProps } from "react";

export interface GeometricAvatarProps extends ComponentProps<typeof Avatar> {
  size?: number;
  name?: string;
}

export default function GeometricAvatar({ ...props }: GeometricAvatarProps) {
  return (
    <Avatar
      {...props}
      variant="sunset"
      colors={["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]}
    />
  );
}
