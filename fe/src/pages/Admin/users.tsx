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
import { t } from "@/lib/i18n";
import { sampleUsers as mockUsers } from "@/mockdata/users.mock";

export type UserRow = {
  id: string;
  name: string;
  avatar?: string;
  role: "Administrator" | "Viewer" | "Moderator";
  status: "Active" | "Inactive";
  socials: string[]; // names of services
  promoted: boolean;
  rating: number; // positive = up, negative = down
  lastLogin: string;
};
const sampleUsers = mockUsers;

export default function UsersPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = (on: boolean) => {
    if (on) {
      const all: Record<string, boolean> = {};
      sampleUsers.forEach((u) => (all[u.id] = true));
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
        <div className="bg-blue-950 border rounded-2xl flex hover:text-amber-300 px-2 py-1">
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
      <Card >
        <CardContent>
          <Table className="p-0">
            <TableHeader >
              <TableRow className="bg-blue-950 text-amber-100 w-full">
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={Object.keys(selected).length === sampleUsers.length}
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
                  <TableHead></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              {sampleUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <input type="checkbox" checked={!!selected[u.id]} onChange={() => toggleSelect(u.id)} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {u.name[0]}
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-muted-foreground">{u.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={u.role === "Administrator" ? "destructive" : u.role === "Moderator" ? "secondary" : "default"}>
                      {u.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                      <span>{u.status}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.socials.map((s) => (
                        <div key={s} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">{s[0].toUpperCase()}</div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Switch checked={u.promoted} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${u.rating >= 0 ? "text-green-600" : "text-red-600"}`}>{u.rating}</span>
                      <span>{u.rating >= 0 ? "↑" : "↓"}</span>
                    </div>
                  </TableCell>

                  <TableCell>{u.lastLogin}</TableCell>

                  <TableCell>
                    <button className="p-2 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <select className="border rounded px-2 py-1">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <div className="text-sm text-muted-foreground">1-10 of 100</div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded">&lt;</button>
              <button className="px-2 py-1 rounded bg-gray-100">1</button>
              <button className="px-2 py-1">2</button>
              <button className="px-2 py-1">3</button>
              <div className="px-2">...</div>
              <button className="px-2 py-1">100</button>
              <button className="px-2 py-1 border rounded">&gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
