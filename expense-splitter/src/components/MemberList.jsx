// components/MemberList.jsx
// Displays member avatars and names in a group

export default function MemberList({ members }) {
  return (
    <div className="flex flex-wrap gap-3">
      {members.map((member, i) => (
        <div
          key={member.id}
          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `hsl(${i * 70 + 200}, 65%, 55%)` }}
          >
            {member.name[0].toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-700">{member.name}</span>
        </div>
      ))}
    </div>
  )
}
