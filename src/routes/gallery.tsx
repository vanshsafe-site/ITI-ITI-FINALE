import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

type GalleryGroup = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

type GalleryItem = {
  id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};

export const Route = createFileRoute("/gallery")({
  component: Gallery,
  head: () => ({
    meta: [
      { title: "Gallery | Iti Iti Yogashram" },
      { name: "description", content: "Browse photos from Iti Iti Yogashram's classes, events and community sessions in Prayagraj and online." },
      { property: "og:title", content: "Gallery | Iti Iti Yogashram" },
      { property: "og:description", content: "Browse photos from Iti Iti Yogashram's classes, events and community sessions in Prayagraj and online." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Gallery() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    void Promise.all([
      supabase.from("gallery_groups").select("*").order("sort_order", { ascending: true }),
      supabase.from("gallery_items").select("*").order("sort_order", { ascending: true }),
    ]).then(([groupsRes, itemsRes]) => {
      setGroups((groupsRes.data as GalleryGroup[]) || []);
      setItems((itemsRes.data as GalleryItem[]) || []);
    });
  }, []);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showClickOutsideInstruction, setShowClickOutsideInstruction] = useState(false);

  const groupedItems = useMemo(() => {
    const map = new Map<string, GalleryItem[]>();
    const validGroupIds = new Set(groups.map((group) => group.id));

    items.forEach((item) => {
      const key = item.group_id && validGroupIds.has(item.group_id) ? item.group_id : "uncategorized";
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });

    return map;
  }, [items, groups]);

  const orderedItems = useMemo(() => {
    const validGroupIds = new Set(groups.map((group) => group.id));
    const map = new Map<string, GalleryItem[]>();

    items.forEach((item) => {
      const key = item.group_id && validGroupIds.has(item.group_id) ? item.group_id : "uncategorized";
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });

    const ordered: GalleryItem[] = [];
    groups.forEach((group) => ordered.push(...(map.get(group.id) || [])));
    ordered.push(...(map.get("uncategorized") || []));
    return ordered;
  }, [items, groups]);

  const selectedItem = selectedIndex !== null ? orderedItems[selectedIndex] : null;
  const uncategorizedItems = groupedItems.get("uncategorized") || [];

  useEffect(() => {
    if (selectedIndex === null) {
      setShowClickOutsideInstruction(false);
      return;
    }

    setShowClickOutsideInstruction(true);
    const timer = window.setTimeout(() => setShowClickOutsideInstruction(false), 2600);
    return () => window.clearTimeout(timer);
  }, [selectedIndex]);

  return (
    <PageLayout>
      <section style={{ padding: "100px 5% 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="section-label">Gallery</div>
          <h1 className="section-title">Yoga events and photo collections</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 16, fontWeight: 300 }}>
            Browse grouped galleries with photos organized by event, practice theme, or class series.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 5% 96px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 64 }}>
          {groups.length === 0 && uncategorizedItems.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--muted)", margin: 0 }}>No galleries are available yet.</p>
            </div>
          ) : (
            <>
              {groups.map((group) => (
                <div key={group.id}>
                  <div style={{ marginBottom: 24 }}>
                    <div className="section-label">{group.title}</div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "var(--forest)", marginTop: 8 }}>{group.title}</h2>
                    {group.description && <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>{group.description}</p>}
                  </div>
                  <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                    {(groupedItems.get(group.id) || []).length === 0 ? (
                      <div className="card" style={{ padding: 32, textAlign: "center" }}>
                        <p style={{ color: "var(--muted)", margin: 0 }}>No images in this gallery yet.</p>
                      </div>
                    ) : (
                      (groupedItems.get(group.id) || []).map((item) => (
                        <div
                          key={item.id}
                          className="card"
                          style={{ overflow: "hidden", cursor: item.image_url ? "pointer" : "default" }}
                          onClick={() => item.image_url && setSelectedIndex(orderedItems.findIndex((ordered) => ordered.id === item.id))}
                          role={item.image_url ? "button" : undefined}
                          tabIndex={item.image_url ? 0 : undefined}
                          onKeyDown={(event) => {
                            if (item.image_url && (event.key === "Enter" || event.key === " ")) {
                              event.preventDefault();
                              setSelectedIndex(orderedItems.findIndex((ordered) => ordered.id === item.id));
                            }
                          }}
                        >
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--leaf)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--forest)", fontSize: "1.5rem" }}>
                              No image
                            </div>
                          )}
                          {item.title || item.description ? (
                            <div style={{ padding: 24 }}>
                              {item.title ? (
                                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "var(--forest)", marginBottom: item.description ? 10 : 0 }}>{item.title}</h3>
                              ) : null}
                              {item.description ? (
                                <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>{item.description}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {uncategorizedItems.length > 0 && (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <div className="section-label">Uncategorized</div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "var(--forest)", marginTop: 8 }}>Uncategorized images</h2>
                    <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 12 }}>
                      These images are uploaded but not assigned to an active gallery group.
                    </p>
                  </div>
                  <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                    {uncategorizedItems.map((item) => (
                      <div
                        key={item.id}
                        className="card"
                        style={{ overflow: "hidden", cursor: item.image_url ? "pointer" : "default" }}
                        onClick={() => item.image_url && setSelectedIndex(orderedItems.findIndex((ordered) => ordered.id === item.id))}
                        role={item.image_url ? "button" : undefined}
                        tabIndex={item.image_url ? 0 : undefined}
                        onKeyDown={(event) => {
                          if (item.image_url && (event.key === "Enter" || event.key === " ")) {
                            event.preventDefault();
                            setSelectedIndex(orderedItems.findIndex((ordered) => ordered.id === item.id));
                          }
                        }}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", aspectRatio: "4/3", background: "var(--leaf)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--forest)", fontSize: "1.5rem" }}>
                            No image
                          </div>
                        )}
                        <div style={{ padding: 24 }}>
                          {item.title ? (
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "var(--forest)", marginBottom: 10 }}>{item.title}</h3>
                          ) : null}
                          <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>{item.description || "No description"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        <DialogContent hideClose className="p-0 max-w-[90vw] max-h-[90vh] overflow-hidden bg-transparent shadow-none">
          {selectedItem ? (
            <div style={{ position: "relative", width: "100%", maxHeight: "90vh", minHeight: 320, background: "black" }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 16,
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: 999,
                  opacity: showClickOutsideInstruction ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              >
                Click outside the image to close
              </div>

              <Carousel
                opts={{ containScroll: "trimSnaps", align: "center" }}
                className="h-full"
              >
                <CarouselContent className="h-full">
                  {orderedItems.map((item) => (
                    <CarouselItem key={item.id} className="h-full flex items-center justify-center">
                      <img
                        src={item.image_url || undefined}
                        alt={item.title || "Gallery image"}
                        style={{ maxWidth: "100%", maxHeight: "90vh", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="!absolute left-4 top-1/2 -translate-y-1/2" />
                <CarouselNext className="!absolute right-4 top-1/2 -translate-y-1/2" />
              </Carousel>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
