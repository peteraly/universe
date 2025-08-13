import bpy
import sys

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create a simple cube
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))

# Print success message
print("Blender Python script executed successfully!")
print(f"Created cube at location: {bpy.context.active_object.location}")

# Exit Blender
bpy.ops.wm.quit_blender()
