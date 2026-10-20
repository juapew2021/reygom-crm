// Office administrators have this feature temporarily disabled.
export function canSearchRentals(user){return user?.role==='superadmin'||user?.role==='agent';}
