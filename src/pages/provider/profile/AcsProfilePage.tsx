import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileBanner from "@/components/ui/profile-banner";
import BottomNavigationBar from "@/components/ui/navigator-bar";
import { AccountService } from "@/api/services/AccountService";
import { ApiService } from "@/api/services/ApiService";
import { LogoutService } from "@/api/services/LogoutService";

interface AcsProfileMenuItem {
  title: string;
  onClick: () => void;
  hasArrow?: boolean;
}

interface AcsProfilePageProps {
  name?: string;
  profileImage?: string;
  onEditProfile?: () => void;
}

const AcsProfilePage: React.FC<AcsProfilePageProps> = ({
  name = "Nome",
  profileImage,
  onEditProfile,
}) => {
  const navigate = useNavigate();
  const [providerId, setProviderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const userEntity = await ApiService.apiUserEntityRetrieve();
        setProviderId(userEntity.provider_id);
      } catch (error) {
        console.error("Erro ao buscar provider_id:", error);
      }
    };
    fetchProviderId();
  }, []);

  const menuItems: AcsProfileMenuItem[] = [
    {
      title: "Termos e condições",
      onClick: () => navigate("/terms"),
      hasArrow: true,
    },
    {
      title: "Logout",
      onClick: async () => {
        const refresh = localStorage.getItem("refreshToken");
        if (!refresh) {
          alert("Refresh token não encontrado.");
          return;
        }
        try {
          await LogoutService.authLogoutCreate({ refresh });
        } catch (error: any) {
          alert(
            error?.message
              ? `Erro ao fazer logout: ${error.message}`
              : "Erro ao fazer logout. Tente novamente.",
          );
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/welcome");
      },
      hasArrow: false,
    },
    {
      title: "Excluir conta",
      onClick: async () => {
        try {
          if (!providerId) {
            alert("ID do profissional não encontrado.");
            return;
          }
          const confirmed = window.confirm(
            `Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.`,
          );
          if (!confirmed) return;
          // alert(`A conta com o ID ${providerId} será excluída.`);
          await AccountService.apiAccountDestroy(providerId);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/welcome");
        } catch (error) {
          alert("Erro ao excluir conta. Tente novamente.");
          console.error(error);
        }
      },
      hasArrow: false,
    },
  ];

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case "home":
        navigate("/acs-main-page");
        break;
      case "patients":
        navigate("/patients");
        break;
      case "emergency":
        navigate("/emergencies");
        break;
      case "profile":
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Profile Banner */}
      <ProfileBanner
        name={name}
        profileImage={profileImage}
        onEditClick={onEditProfile}
      />

      {/* Menu Items */}
      <div className="z-10 h-[calc(100vh-12rem)] pt-2">
        <ul className="px-4 bg-white rounded-xl shadow-sm overflow-hidden h-full">
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <li
                className="px-4 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={item.onClick}
              >
                <span className="text-gray-800 font-inter text-sm">
                  {item.title}
                </span>
                {item.hasArrow && (
                  <span className="mgc_right_line text-md"></span>
                )}
              </li>
              {index < menuItems.length - 1 && (
                <div className="border-b border-gray-100 mx-4"></div>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <BottomNavigationBar
        variant="acs"
        initialActiveId="profile"
        onItemClick={handleNavigationClick}
      />
    </div>
  );
};

export default AcsProfilePage;
