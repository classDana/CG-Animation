/**
 * a phong shader implementation
 * Created by Samuel Gratzl on 29.02.2016.
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	bool spotlight;
	vec3 lightDir;
};

//use uniform for material
uniform Material u_material;
//use uniform for light
uniform Light u_light;
uniform Light u_light2;
uniform Light u_light3;

//varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light2Vec;
varying vec3 v_light3Vec;

uniform bool u_enableObjectTexture;

varying vec2 v_texCoord;
uniform sampler2D u_tex;

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

	//for texture setting
	material.diffuse = textureColor;
	material.ambient = textureColor;
  	
	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

vec4 calculateSpotLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {
	//normalize vector
	lightVec = normalize(lightVec);
	// if its a spotlight calculate
	if(light.spotlight){
		vec3 lightDir = normalize(light.lightDir);
		lightDir = -lightDir;
		float dir = dot(lightVec, lightDir);
		vec4 c_spec = clamp(light.specular * material.specular, 0.0, 1.0);
		vec4 c_em   = material.emission;
		//spotlight return value
		return c_spec + c_em;
	}
	//return value if no spotlight
	return calculateSimplePointLight(light, material, lightVec, normalVec, eyeVec, textureColor);
}

void main() {
	vec4 textureColor = vec4(0,0,0,1); 
  	if(u_enableObjectTexture)
  	{ 
		textureColor = texture2D(u_tex, v_texCoord);
  	}

	gl_FragColor =
			calculateSpotLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor)
			+ calculateSpotLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec, textureColor)
			+ calculateSpotLight(u_light3, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor);
}