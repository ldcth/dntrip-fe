import React, { FC, useCallback } from "react";
import Image from "next/image";
import { DefaultAvatarIcon, LogoutIcon } from "@/assets/icons";
import { useDispatch, useSelector } from "react-redux";
import { authSelector, logout } from "@/redux/reducers";
import { Dropdown } from "antd";
import { DropdownProps } from "antd";

interface UserInforProps extends DropdownProps {}

const UserInformation: FC<UserInforProps> = ({ className, ...props }) => {
  const { user } = useSelector(authSelector);
  const dispatch = useDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, []);

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "1",
            label: (
              <div
                onClick={handleLogout}
                className="h-[30px] flex flex-row items-center"
              >
                <Image src={LogoutIcon} alt="Logout" height={20} />
                <span className="ml-3 text-base font-sans text-black">
                  Logout
                </span>
              </div>
            ),
          },
        ],
      }}
      className={`flex flex-row items-center cursor-pointer p-[10px] hover:bg-gray-200 rounded-xl  ${className}`}
      {...props}
    >
      <div className="flex flex-row items-center gap-3 ">
        <div className="rounded-full w-[40px] h-[40px] bg-white border border-gray-200 flex items-center justify-center">
          <Image
            src={DefaultAvatarIcon}
            alt="Logo"
            className="w-[40px] h-[40px] rounded-full"
          />
        </div>
        <span className="font-sans font-medium text-black text-base">
          {user?.name}
        </span>
      </div>
    </Dropdown>
  );
};

export default UserInformation;
