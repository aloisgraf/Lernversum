import { logoutAction } from "./actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="lv-btn lv-btn-quiet">
        Abmelden
      </button>
    </form>
  );
}
