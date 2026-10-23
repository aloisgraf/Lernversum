import { logoutAction } from "./actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="rounded-full border px-4 py-2">
        Abmelden
      </button>
    </form>
  );
}
