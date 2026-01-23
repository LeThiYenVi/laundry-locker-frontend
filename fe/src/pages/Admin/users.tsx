import * as React from "react";
import { ChartBar, MoreHorizontal, Trash2, Settings, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui";
import { Avatar, Badge, Switch } from "~/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { t } from "@/lib/i18n";
import { sampleUsers as mockUsers } from "@/mockdata/users.mock";

export type UserRow = {
  id: string;
  name: string;
  avatar?: string;
  role: "Administrator" | "Viewer" | "Moderator";
  status: "Active" | "Inactive";
  socials: string[];
  promoted: boolean;
  rating: number;
  lastLogin: string;
};
// data loaded into state so it can be replaced by API calls later

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};
export default function UsersPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  // users state (initialized from mock data, replace with API call later)
  const [users, setUsers] = React.useState<UserRow[]>(mockUsers);

  React.useEffect(() => {
    // TODO: replace with API call and setUsers(response)
  }, []);

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = (on: boolean) => {
    if (on) {
      const all: Record<string, boolean> = {};
      users.forEach((u) => (all[u.id] = true));
      setSelected(all);
    } else setSelected({});
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.users.header.allUsers')}</div>
            <div className="font-semibold">1,356,546</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.users.header.projects')}</div>
            <div className="font-semibold">884</div>
            <ChartBar className="text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Settings size={16} /> {t('admin.users.table.settings')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className={`${tableHeader.bg} border rounded-md flex hover:text-amber-300 px-2 py-1`}>
          <Button variant="default" size="icon" className=" text-amber-100 ">
            <Plus size={16} />
          </Button>
          <Button variant="default" size="sm" className=" text-amber-100 ">
            {t('admin.users.toolbar.add')}
          </Button>
        </div>
        <div className="flex items-center gap-2 border rounded-2xl px-2 py-1">
          <Button variant="ghost">{t('admin.users.toolbar.suspendAll')}</Button>
          <Button variant="ghost">{t('admin.users.toolbar.archiveAll')}</Button>
          <Button variant="ghost" className="text-red-600">{t('admin.users.toolbar.deleteAll')}</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full p-0">
            <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
              <TableRow>
                  <TableHead className="rounded-tl-md">
                    <input
                      type="checkbox"
                      checked={Object.keys(selected).length === users.length}
                      onChange={(e) => selectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>{t('admin.users.table.columns.user')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.role')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.status')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.social')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.promote')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.rating')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.lastLogin')}</TableHead>
                  <TableHead className="rounded-tr-md">{t('admin.orders.table.action')}</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="h-10">
                  <TableCell className="py-2">
                    <input type="checkbox" checked={!!selected[u.id]} onChange={() => toggleSelect(u.id)} />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 text-sm">
                        {u.name[0]}
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-muted-foreground">{u.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <Badge variant={u.role === "Administrator" ? "destructive" : u.role === "Moderator" ? "secondary" : "default"}>
                      {u.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                      <span>{u.status}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      {u.socials.map((s) => (
                        <div key={s} className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">{s[0].toUpperCase()}</div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <Switch checked={u.promoted} />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${u.rating >= 0 ? "text-green-600" : "text-red-600"}`}>{u.rating}</span>
                      <span>{u.rating >= 0 ? "↑" : "↓"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">{u.lastLogin}</TableCell>

                  <TableCell className="py-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between  border-t border-black-200 pt-4 pl-2 pr-2 pb-2">
            <div className="flex items-center gap-4">
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            <div className="text-sm text-muted-foreground">1-10 of 100</div>
            </div>

            <Pagination className="">
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">100</PaginationLink>
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
