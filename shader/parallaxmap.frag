// The height map and texture map itself 
uniform sampler2D heightMap; 
uniform sampler2D textureMap;

//The vertex color passed
varying vec4 passColor;

// The transformed light direction and view direction
varying vec3 lightDir;
varying vec3 viewDir;

// The geometric normal
varying vec3 normal;


// ############# FUNCTIONS ###############
float getIntersectionHeight(vec2 p1, vec2 p2, vec2 p3, vec p4);

void main() 
{
	vec3 lightDirNormalized = normalize( lightDir );
	vec3 viewDirNormalized = normalize( viewDir );
	vec3 normalNormalized = normalize( normal );
	
	// the initial/input texture coordinate
	// NOTE: this is the coordinate that would be used
	// for basic texture mapping 
	vec3 t0 = vec3(gl_TexCoord[0].xy, 0.0);
	
	// calculate number of samples n
	// n = n_min + N.V_ts*(n_max-n_min)
	// see page 66 ATI parallax paper
	float n = 8.0 + dot(normalNormalized, viewDirNormalized) * 24.0;
	
	//
	// FOR NOW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//
	float offsetLimit = 2.0;
	
	// the step size
	float delta = offsetLimit / n;
	
	// stepVector is the interval stride
	vec3 stepVec = viewDirNormalized * delta;
	
	vec3 prevSampleVec = t0;
	vec3 currSampleVec = t0 + stepVec;
	
	float prevSurfaceHeight = texture2D(heightMap, prevSampleVec.xy);
	float currSurfaceHeight = texture2D(heightMap, currSampleVec.xy);
	
	// while the current surface height is bigger than our vector's height
	// AND we didn't reach the offsete limit
	while(( currSurfaceHeight < stepVec.z ) && (length(currSampleVec) < offsetLimit))
	{	
		// update the two vectors
		prevSampleVec = currSampleVec;
		currSampleVec += stepVec;
		
		// and their corresponding heights
		prevSurfaceHeight = currSurfaceHeight;
		currSurfaceHeight = texture2D(heightMap, currSampleVec.xy);
	}
	
	vec3 toffset;
	
	if( length(currSampleVec) > offsetLimit )
	{
		// ?????
		// perhaps take the offsetLimit as the displacement?
		// toffset.x = offsetLimit;
		// toffset.y = offsetLimit;
	}
	else
	{
		float intersectionHeight = getIntersectionHeight( prevSampleVec.xz,
					currSampleVec.xz, vec2(prevSample.x, prevSurfaceHeight),
					vec2(currSampleVec.x, currSurfaceHeight) );
					
		float ratio = intersectionHeight / viewDirNormalized.z;
		
		toffset = vec3(viewDirNormalized.xy * ratio, intersectionHeight);
	}
	

	
	gl_fragColor = texture2D(textureMap, toffset);
}


float getIntersectionHeight(vec2 p1, vec2 p2, vec2 p3, vec p4)
{
	return ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) /
			((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));
}