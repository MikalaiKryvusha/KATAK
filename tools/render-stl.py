# render-stl.py — renders an STL to a PNG in Blender, headless, for looking at the generated geometry with our own eyes
# (and later for README pictures). Run with the machine's Blender (HOUSE_RULES.md dossier):
#   "C:/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b -P tools/render-stl.py -- in.stl out.png [view]
# view: iso (default) | front (looking into the nose along the axis) | side
# [NOT-TESTED]
import sys, math
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, out = argv[0], argv[1]
view = argv[2] if len(argv) > 2 else "iso"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.stl_import(filepath=src)
obj = bpy.context.selected_objects[0]
mat = bpy.data.materials.new("katak")
mat.diffuse_color = (1.0, 0.10, 0.55, 1.0)
obj.data.materials.append(mat)

# frame the object: its bounding box centre and size
bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
lo = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
hi = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
centre, size = (lo + hi) / 2, max((hi - lo).x, (hi - lo).y, (hi - lo).z)

cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = size * 1.25
cam = bpy.data.objects.new("cam", cam_data)
bpy.context.scene.collection.objects.link(cam)
d = size * 3
dirs = {"iso": Vector((1.0, -1.2, 0.9)), "front": Vector((0.0001, 0.0, -1.0)), "side": Vector((0.0, -1.0, 0.0001))}
cam.location = centre + dirs.get(view, dirs["iso"]).normalized() * d
cam.rotation_euler = (centre - cam.location).to_track_quat("-Z", "Y").to_euler()
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "MATERIAL"
scene.display.shading.show_cavity = True
scene.render.resolution_x = scene.render.resolution_y = 900
scene.render.film_transparent = False
scene.world = bpy.data.worlds.new("w")
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("rendered", out)
